import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin, urlparse, parse_qs

BASE_URL = "https://www.univ-ghardaia.edu.dz/en/"

def get_soup(url):
    resp = requests.get(url)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")

# 1) Main nav → faculties
soup = get_soup(BASE_URL)
nav = soup.find("nav", id="main-nav")

faculties = []
fac_menu = nav.find("a", string="Faculties").find_parent("li")
for a in fac_menu.select("div.mega-menu-block ul.sub-menu-columns a.mega-links-head"):
    name = a.get_text(strip=True)
    href = a["href"]
    url  = href if href.startswith("http") else urljoin(BASE_URL, href)
    faculties.append({"name": name, "url": url})

# 2) Events page URL
evt_href = nav.find("a", string="Events")["href"]
events_url = evt_href if evt_href.startswith("http") else urljoin(BASE_URL, evt_href)

# 3) Scrape featured events
soup_evt = get_soup(events_url)
featured_events = []
for post in soup_evt.select("div#featured-posts .featured-post"):
    inner = post.find("div", class_="featured-post-inner")
    # image
    style = inner.get("style", "")
    img_match = re.search(r'url\(([^)]+)\)', style)
    image_url = img_match.group(1) if img_match else None

    # title & link
    cover = inner.find("div", class_="featured-cover").find("a")
    link  = cover["href"]
    title = cover.get_text(strip=True)

    # date
    date = inner.find("span", class_="tie-date")
    date = date.get_text(strip=True) if date else None

    featured_events.append({
        "title": title,
        "link": link,
        "image_url": image_url,
        "date": date
    })

# 4) Follow each event → PDF or text
for evt in featured_events:
    soup_e = get_soup(evt["link"])

    # a) PDF embed?
    iframe = soup_e.find("iframe", class_="embed-pdf-viewer")
    if iframe and iframe.get("src"):
        src = iframe["src"]
        # If it's a Google Viewer URL, pull the real PDF URL from its query
        parsed = urlparse(src)
        qs = parse_qs(parsed.query)
        pdf_url = qs.get("url", [src])[0]
        evt["pdf_url"] = pdf_url

    else:
        # b) Otherwise grab textual content
        content_div = (
            soup_e.find("div", class_="entry-content")
            or soup_e.find("div", class_="post-content")
            or soup_e.find("article")
        )
        text = None
        if content_div:
            text = content_div.get_text(separator="\n", strip=True)
        evt["content"] = text

# 5) Write out JSON
data = {
    "faculties":       faculties,
    "events_page":     events_url,
    "featured_events": featured_events
}

with open("faculties.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ Saved all faculties and featured events (with PDF/text) to faculties.json")
