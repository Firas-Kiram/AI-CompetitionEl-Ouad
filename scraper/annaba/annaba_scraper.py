import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json
import re

BASE_URL = "https://www.univ-annaba.dz/"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/113.0.0.0 Safari/537.36"
    )
}

def fetch_soup(url):
    resp = requests.get(url, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")

def extract_section(soup, heading_regex):
    """
    Finds a heading matching heading_regex (e.g. 'Actualit' or 'Evenement'),
    then grabs the next <ul> or list of <article> items.
    Returns a list of BeautifulSoup tag containers.
    """
    # 1) Look for an h2/h3 whose text matches
    heading = soup.find(lambda tag: tag.name in ("h2","h3","h4")
                                 and re.search(heading_regex, tag.get_text(), re.I))
    if not heading:
        return []
    # 2) Either the items are in a sibling <ul>/<div>, or wrap <article> tags
    #    Try sibling <ul> first:
    sibling = heading.find_next_sibling()
    if sibling and sibling.name in ("ul","div"):
        return sibling.find_all("li") or sibling.find_all("article") or sibling.find_all(recursive=False)
    # 3) Fallback: find all <article> under the same parent
    return heading.parent.find_all("article")

def parse_items(containers, base):
    items = []
    for c in containers:
        # title + link
        a = c.find("a", href=True)
        title = a.get_text(strip=True) if a else c.get_text(strip=True)
        link  = urljoin(base, a["href"]) if a else None

        # date
        date_tag = c.find("time") or c.find("span", class_="date")
        date = date_tag.get_text(strip=True) if date_tag else None

        # image
        img = c.find("img")
        img_url = urljoin(base, img["src"]) if img and img.get("src") else None

        items.append({
            "title": title,
            "date":  date,
            "image": img_url,
            "link":  link
        })
    return items

def extract_faculties(soup):
    """
    Finds the 'Nos Facultés' or 'Faculté' section, then all <a> under it.
    """
    # Try a heading first
    heading = soup.find(lambda tag: tag.name in ("h2","h3","h4")
                                 and re.search(r"Facult", tag.get_text(), re.I))
    if not heading:
        return []
    container = heading.find_next_sibling("ul") or heading.parent
    links = container.find_all("a", href=True)
    seen = set()
    faculties = []
    for a in links:
        name = a.get_text(strip=True)
        href = urljoin(BASE_URL, a["href"])
        if href not in seen and re.search(r"facult", href, re.I):
            seen.add(href)
            faculties.append({"name": name, "link": href})
    return faculties

def main():
    soup = fetch_soup(BASE_URL)

    # 1) News
    news_containers = extract_section(soup, r"Actualit")
    news = parse_items(news_containers, BASE_URL)   # :contentReference[oaicite:0]{index=0}

    # 2) Events
    events_containers = extract_section(soup, r"Evenement")
    events = parse_items(events_containers, BASE_URL)

    # 3) Faculties
    faculties = extract_faculties(soup)             # :contentReference[oaicite:1]{index=1}

    data = {
        "news":      news,
        "events":    events,
        "faculties": faculties
    }

    # Write out to JSON
    with open("annaba.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Saved", len(news), "news items,", len(events), "events and",
          len(faculties), "faculties to annaba.json")

if __name__ == "__main__":
    main()
