import requests
from bs4 import BeautifulSoup
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_event_content(art_soup):
    """
    Search through all containers with class 'elementor-widget-container'
    and check if they have an <h1> element and at least three <h3> elements.
    If found, extract the text from the first three <h3> elements.
    Otherwise, log an error and return an empty string.
    """
    container_candidates = art_soup.find_all("div", class_="elementor-widget-container")
    for container in container_candidates:
        h1 = container.find("h1")
        h3_tags = container.find_all("h3")
        if h1 and len(h3_tags) >= 3:
            # Container meets the structure: h1 with following multiple h3
            return "\n".join(tag.get_text(separator=" ", strip=True) for tag in h3_tags[:3])
    
    logger.error("No valid container found with an <h1> and at least three <h3> elements.")
    return ""

def scrape_eloued_news():
    base_url = "https://www.univ-eloued.dz/en/event2023/"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/113.0.0.0 Safari/537.36"
        )
    }
    
    # Fetch the news (or event) page
    response = requests.get(base_url, headers=headers)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Find all article containers on the news/event page
    articles = soup.find_all("div", class_="rt-holder tpg-post-holder")
    news_list = []
    
    # Process only the first 10 articles
    for article in articles[:10]:
        detail = article.find("div", class_="rt-detail rt-el-content-wrapper")
        if not detail:
            continue
        
        # Extract title and link from the <h3> tag within the entry-title wrapper
        title_wrapper = detail.find("div", class_="entry-title-wrapper")
        if not title_wrapper:
            continue
        
        h3_tag = title_wrapper.find("h3", class_="entry-title")
        a_tag = h3_tag.find("a") if h3_tag else None
        if not a_tag:
            continue
        
        title = a_tag.get_text(strip=True)
        link = a_tag.get("href")
        
        # Get the publication date from meta tags
        meta = detail.find("div", class_="post-meta-tags rt-el-post-meta")
        date_span = meta.find("span", class_="date") if meta else None
        date_a = date_span.find("a") if date_span else None
        date_text = date_a.get_text(strip=True) if date_a else ""
        
        # Initialize article content and image URL
        article_content = ""
        image_url = ""
        
        # Fetch the full article content and image
        try:
            art_resp = requests.get(link, headers=headers)
            art_resp.raise_for_status()
            art_soup = BeautifulSoup(art_resp.text, "html.parser")
            
            # Extract featured image URL from a container with class "elementor-widget-image"
            image_div = art_soup.find("div", class_="elementor-widget-image")
            if image_div:
                img_tag = image_div.find("img")
                if img_tag:
                    image_url = img_tag.get("src", "").strip()
            
            # Use the dynamic function to extract only if the container meets the structure criteria
            article_content = extract_event_content(art_soup)
            
        except Exception as e:
            logger.error(f"Error fetching article content from {link}: {e}")
        
        news_item = {
            "title": title,
            "date": date_text,
            "link": link,
            "content": article_content,
            "image": image_url
        }
        news_list.append(news_item)
    
    return news_list

if __name__ == "__main__":
    news_data = scrape_eloued_news()
    output_filename = "eloued_news.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(news_data, f, ensure_ascii=False, indent=4)
    print(f"Successfully scraped {len(news_data)} articles and saved them to '{output_filename}'")
