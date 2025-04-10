import requests
from bs4 import BeautifulSoup
import json

def scrape_eloued_events():
    base_url = "https://www.univ-eloued.dz/en/meet/"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/113.0.0.0 Safari/537.36"
        )
    }
    
    # Fetch the events page
    response = requests.get(base_url, headers=headers)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Find all article containers on the events page
    articles = soup.find_all("div", class_="rt-holder tpg-post-holder")
    
    events_list = []
    
    # Process only the first 10 articles
    for article in articles[:10]:
        # Find the detail container
        detail = article.find("div", class_="rt-detail rt-el-content-wrapper")
        if not detail:
            continue
        
        # Get the title and link from the <h3> tag within the entry-title wrapper
        title_wrapper = detail.find("div", class_="entry-title-wrapper")
        if not title_wrapper:
            continue
        
        h3_tag = title_wrapper.find("h3", class_="entry-title")
        a_tag = h3_tag.find("a") if h3_tag else None
        if not a_tag:
            continue
        
        title = a_tag.get_text(strip=True)
        link = a_tag.get("href")
        
        # Get the publication date from the meta tags
        meta = detail.find("div", class_="post-meta-tags rt-el-post-meta")
        date_span = meta.find("span", class_="date") if meta else None
        date_a = date_span.find("a") if date_span else None
        date_text = date_a.get_text(strip=True) if date_a else ""
        
        # Initialize article content and image URL
        article_content = ""
        image_url = ""
        
        # Follow the link to scrape the full article content and image
        try:
            art_resp = requests.get(link, headers=headers)
            art_resp.raise_for_status()
            art_soup = BeautifulSoup(art_resp.text, "html.parser")
            
            # Extract the featured image URL from a container with class "elementor-widget-image"
            image_div = art_soup.find("div", class_="elementor-widget-image")
            if image_div:
                img_tag = image_div.find("img")
                if img_tag:
                    image_url = img_tag.get("src", "").strip()
            
            # Attempt to find a container with class "entry-content" for the main text
            content_div = art_soup.find("div", class_="entry-content")
            if content_div:
                article_content = content_div.get_text(separator="\n", strip=True)
            else:
                # Fallback: use the full text of the page
                article_content = art_soup.get_text(separator="\n", strip=True)
        except Exception as e:
            print(f"Error fetching article content from {link}: {e}")
        
        # Build our article data structure
        events_item = {
            "title": title,
            "date": date_text,
            "link": link,
            "content": article_content,
            "image": image_url
        }
        events_list.append(events_item)
    
    return events_list

if __name__ == "__main__":
    # Scrape the events and write the results to a JSON file
    events_data = scrape_eloued_events()
    output_filename = "eloued_events.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(events_data, f, ensure_ascii=False, indent=4)
    print(f"Successfully scraped {len(events_data)} articles and saved them to '{output_filename}'")
