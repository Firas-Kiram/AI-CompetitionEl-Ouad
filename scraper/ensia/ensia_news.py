import httpx
from bs4 import BeautifulSoup
import json
import urllib.parse

def scrape_ensia_news():
    base_url = 'https://www.ensia.edu.dz'
    news_path = '/news/'
    news_url = urllib.parse.urljoin(base_url, news_path)

    headers = {
        "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/113.0.0.0 Safari/537.36")
    }

    try:
        with httpx.Client(headers=headers, timeout=10) as client:
            response = client.get(news_url)
            response.raise_for_status()  # Raise an error for HTTP issues
    except httpx.HTTPStatusError as e:
        print(f"HTTP error: {e.response.status_code} - {e.response.text[:100]}")
        return
    except Exception as e:
        print(f"Connection error: {e}")
        return

    soup = BeautifulSoup(response.text, 'html.parser')
    news_items = []

    # Locate the container holding the articles
    archive_container = soup.find('div', id='archive-container')
    if not archive_container:
        archive_container = soup  # Fallback to whole page if not found

    # Each news article is in an <article> tag with class "entry"
    articles = archive_container.find_all('article', class_='entry')
    for article in articles:
        item = {}

        # Extract the title and URL
        header = article.find('h2', class_='entry-title')
        if header:
            link = header.find('a')
            if link and link.get('href'):
                item['url'] = urllib.parse.urljoin(base_url, link['href'])
                item['title'] = link.get_text(strip=True)

        # Extract the description
        summary_div = article.find('div', class_='entry-summary')
        if summary_div:
            desc_paragraph = summary_div.find('p')
            if desc_paragraph:
                item['description'] = desc_paragraph.get_text(strip=True)

        # Extract the image URL
        thumbnail = article.find('a', class_='post-thumbnail')
        if thumbnail:
            img = thumbnail.find('img')
            if img and img.get('src'):
                item['image'] = urllib.parse.urljoin(base_url, img['src'])

        # Append the item if it has a URL and title
        if item.get('url') and item.get('title'):
            news_items.append(item)

    # Convert the collected news items into JSON
    json_data = json.dumps(news_items, ensure_ascii=False, indent=4)

    # Save the JSON data to a file
    with open('ensia_news.json', 'w', encoding='utf-8') as json_file:
        json_file.write(json_data)

    return json_data

if __name__ == '__main__':
    news_json = scrape_ensia_news()
    if news_json:
        print(news_json)