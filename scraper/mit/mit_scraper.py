#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup, NavigableString
import feedparser
import json
from urllib.parse import urljoin

def extract_specialties(dept_url):
    """
    Fetches a department page and extracts the Groups section
    (which serves as MIT’s specialties) along with storing both
    the group name and URL.
    
    It first searches for an h2 tag with id "groups" (as on pages
    like https://architecture.mit.edu/). If found, it looks for the 
    following container div with the list of group links. Each group 
    link is stored as a dictionary with keys "name" and "url".
    
    If the Groups section is not found, it falls back to scanning
    header tags containing the keyword "group".
    """
    try:
        resp = requests.get(dept_url, timeout=10)
        resp.raise_for_status()
    except requests.RequestException:
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    specialties = []
    
    # Look for the dedicated "Groups" section
    groups_header = soup.find("h2", id="groups")
    if groups_header:
        container = groups_header.find_parent("div", class_="container")
        if container:
            # Find the div that contains the links (matching part of its class)
            links_div = container.find("div", class_=lambda x: x and "field--name-field-large-links" in x)
            if links_div:
                for item in links_div.find_all("div", class_="field__item"):
                    # Each item should contain a URL div with the group link.
                    url_div = item.find("div", class_=lambda x: x and "field--name-field-url" in x)
                    if url_div:
                        a_tag = url_div.find("a", href=True)
                        if a_tag:
                            group_url = urljoin(dept_url, a_tag["href"])
                            group_name = a_tag.get_text(strip=True)
                            specialties.append({"name": group_name, "url": group_url})

    # Fallback to a heuristic if no specialties were found above.
    if not specialties:
        keywords = ["group"]
        for header in soup.find_all(["h2", "h3"]):
            header_text = header.get_text(strip=True).lower()
            if any(kw in header_text for kw in keywords):
                # Attempt to use a nearby <ul> list if available.
                ul = header.find_next_sibling("ul")
                if ul:
                    for li in ul.find_all("li"):
                        a = li.find("a", href=True)
                        if a:
                            group_url = urljoin(dept_url, a["href"])
                            group_name = a.get_text(strip=True)
                            specialties.append({"name": group_name, "url": group_url})
                else:
                    # Otherwise scan through the siblings until the next header is reached.
                    for sib in header.next_siblings:
                        if getattr(sib, "name", None) in ("h2", "h3"):
                            break
                        for a in getattr(sib, "find_all", lambda *args, **kwargs: [])("a", href=True):
                            group_url = urljoin(dept_url, a["href"])
                            group_name = a.get_text(strip=True)
                            specialties.append({"name": group_name, "url": group_url})
    return specialties

def scrape_mit():
    base_url = "https://web.mit.edu/education/schools-and-departments/"
    data = {
        "name": "MIT",
        "url": base_url,
        "faculties": [],
        "departments": [],
        "specialties": [],  # Aggregated specialties (Groups) at the root level, if desired.
        "news": [],
        "events": []
    }

    # 1. Faculties & Departments (with URLs)
    resp = requests.get(data["url"])
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    schools_h2 = soup.find("h2", string=lambda t: t and "Schools & Departments" in t)
    schools_ul = schools_h2.find_next("ul") if schools_h2 else None
    if not schools_ul:
        raise RuntimeError("Could not find Schools & Departments list")

    for school_li in schools_ul.find_all("li", recursive=False):
        a_school = school_li.find("a")
        if not a_school:
            continue
        school_name = a_school.get_text(strip=True)
        data["faculties"].append(school_name)

        # Look for department items within the school.
        for dept_li in school_li.find_all("li", class_="sortable-list__item"):
            a = dept_li.find("a", href=True)
            if not a:
                continue
            dept_name = a.get_text(strip=True)
            dept_url = urljoin(data["url"], a["href"])
            specs = extract_specialties(dept_url)
            data["departments"].append({
                "name": dept_name,
                "url": dept_url,
                "specialties": specs
            })
            # Optionally aggregate all specialties at the root level.
            for s in specs:
                if s not in data["specialties"]:
                    data["specialties"].append(s)

    # 2. News (latest 5)
    feed = feedparser.parse("https://news.mit.edu/rss")
    for entry in feed.entries[:5]:
        data["news"].append({
            "title": entry.title,
            "url": entry.link,
            "published": entry.published
        })

    # 3. Events (first 5)
    ev_url = "https://calendar.mit.edu/"
    resp = requests.get(ev_url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    count = 0
    for h3 in soup.find_all("h3"):
        a = h3.find("a", href=True)
        if not a:
            continue

        title = a.get_text(strip=True)
        event_url = urljoin(ev_url, a["href"])

        # Extract date/time info from immediate siblings.
        date = ""
        for sib in h3.next_siblings:
            if hasattr(sib, "get_text"):
                txt = sib.get_text(strip=True)
            elif isinstance(sib, NavigableString):
                txt = str(sib).strip()
            else:
                continue

            if txt:
                date = txt
                break

        data["events"].append({
            "title": title,
            "url": event_url,
            "datetime": date
        })
        count += 1
        if count >= 5:
            break

    return data

if __name__ == "__main__":
    result = scrape_mit()
    print(json.dumps(result, indent=4))
