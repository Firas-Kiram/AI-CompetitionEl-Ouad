import json

# Load the data from the JSON file
with open('to_send_reviews.json', 'r') as f:
    data = json.load(f)

# Create the new structure for the data
new_data = {"documents": []}
for item in data:
    # Append just the text to the documents list
    new_data["documents"].append(item["text"].strip())

# Write the new data to the final JSON file
with open('final.json', 'w') as f:
    json.dump(new_data, f, indent=4)