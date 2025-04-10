from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig
from bertopic import BERTopic
import torch
import torch.nn.functional as F
from safetensors.torch import load_file
import json
import pickle

app = Flask(__name__)
CORS(app)

# Load models at startup
try:
    print("🔄 Loading models...")

    # Classification model
    model_weights_path = './models/classification/finalReviewClassifier.safetensors'
    config_path = './models/classification/finalReviewClassifierConfig.json'

    with open(config_path, 'r') as f:
        config_dict = json.load(f)

    config = AutoConfig.from_pretrained("distilbert-base-uncased", **config_dict)
    classification_model = AutoModelForSequenceClassification.from_config(config)
    classification_model.load_state_dict(load_file(model_weights_path))

    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

    # BERTopic model
    labeling_model = BERTopic.load("./models/labeling/final")
    with open('./models/labeling/rep_docs.pickle', 'rb') as handle:
        rep_docs = pickle.load(handle)
    with open('./models/labeling/reduced_embeddings.pickle', 'rb') as handle:
        reduced_embeddings = pickle.load(handle)

    # Topic ID to label map
    id_to_label = {
        tid: label for tid, label in zip(
            labeling_model.topic_labels_.keys(), labeling_model.custom_labels_
        )
    }

    print("✅ Models loaded successfully!")

except Exception as e:
    raise RuntimeError(f"❌ Error loading models or data: {e}")


@app.route("/classify", methods=["GET", "POST"])
def classify():
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "Missing 'text' field"}), 400

    inputs = tokenizer(text, return_tensors="pt")

    with torch.no_grad():
        outputs = classification_model(**inputs)
        logits = outputs.logits
        probs = F.softmax(logits, dim=-1)
        pred_id = torch.argmax(probs, dim=-1).item()
        prediction = "positive" if pred_id else "negative"

    return jsonify({
        "text": text,
        "prediction": prediction,
        "probabilities": probs.tolist()
    })

@app.route("/", methods=["GET" , "POST"])
def topic():
    return "hello world"

@app.route("/label", methods=["POST" , "GET"])
def label():
    data = request.json
    docs = data.get("documents", [])

    if not isinstance(docs, list) or not docs:
        return jsonify({"error": "Missing or invalid 'documents' list"}), 400

    results = []
    for doc in docs:
        # Sentiment classification
        inputs = tokenizer(doc, return_tensors="pt")
        with torch.no_grad():
            outputs = classification_model(**inputs)
            logits = outputs.logits
            pred_id = torch.argmax(logits, dim=-1).item()
            sentiment = "positive" if pred_id else "negative"

        # Topic labeling
        topic_array = labeling_model.transform([doc])
        topic_id = topic_array[0].item()  # Get the first item
        topic_label = id_to_label.get(topic_id, "Unknown Topic")

        # Append results with only sentiment and topic label
        results.append({
            "sentiment": sentiment,
            "topic_label": topic_label
        })

    return jsonify(results)

@app.route("/get_json", methods=["GET" , "POST"])
def get_json():
    json_file_path = './to_send_reviews.json'  # Specify your JSON file path here
    try:
        with open(json_file_path, 'r') as json_file:
            data = json.load(json_file)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
