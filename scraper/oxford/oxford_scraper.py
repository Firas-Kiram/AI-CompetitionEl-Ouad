#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import urljoin

BASE_URL = "https://www.ox.ac.uk"

def scrape_page(url):
    """Helper function to fetch and parse a page."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def scrape_graduate_courses():
    """Scrapes the graduate courses listing page."""
    url = urljoin(BASE_URL, "/admissions/graduate/courses/courses-a-z-listing")
    soup = scrape_page(url)
    courses = []
    if soup:
        # Assumes that each course is listed in an <a> tag within a container;
        # adjust the selector based on actual page structure.
        # For example, many Oxbridge listings use a container with class "az-listing"
        container = soup.find("div", class_="az-listing")
        if container:
            for a in container.find_all("a", href=True):
                course_name = a.get_text(strip=True)
                course_url = urljoin(url, a["href"])
                courses.append({"name": course_name, "url": course_url})
    return courses

def scrape_graduate_colleges():
    """Scrapes the graduate colleges listing page."""
    url = urljoin(BASE_URL, "/admissions/graduate/colleges/college-listing")
    soup = scrape_page(url)
    colleges = []
    if soup:
        # Assume the page contains a list (<ul> or <div>) of colleges.
        # For example, look for a container with class "az-list" or similar.
        container = soup.find("div", class_="az-listing")
        if container:
            for a in container.find_all("a", href=True):
                college_name = a.get_text(strip=True)
                college_url = urljoin(url, a["href"])
                colleges.append({"name": college_name, "url": college_url})
    return colleges

def scrape_undergraduate_courses():
    """Scrapes the undergraduate courses listing page."""
    url = urljoin(BASE_URL, "/admissions/undergraduate/courses/course-listing")
    soup = scrape_page(url)
    courses = []
    if soup:
        # Adjust the selector as needed; here we assume the courses are in a container.
        container = soup.find("div", class_="az-listing")
        if container:
            for a in container.find_all("a", href=True):
                course_name = a.get_text(strip=True)
                course_url = urljoin(url, a["href"])
                courses.append({"name": course_name, "url": course_url})
    return courses

def scrape_undergraduate_colleges():
    """Scrapes the undergraduate colleges listing page."""
    url = urljoin(BASE_URL, "/admissions/undergraduate/colleges/a-z-of-colleges")
    soup = scrape_page(url)
    colleges = []
    if soup:
        # Again, adjust the CSS selector according to the page’s actual structure.
        container = soup.find("div", class_="az-listing")
        if container:
            for a in container.find_all("a", href=True):
                college_name = a.get_text(strip=True)
                college_url = urljoin(url, a["href"])
                colleges.append({"name": college_name, "url": college_url})
    return colleges

def scrape_events():
    """Scrapes the events page."""
    url = urljoin(BASE_URL, "/events-list")
    soup = scrape_page(url)
    events = []
    if soup:
        # Assume each event is contained in an element with class "event-item"
        for event in soup.find_all("div", class_="event-item"):
            a = event.find("a", href=True)
            if not a:
                continue
            event_title = a.get_text(strip=True)
            event_url = urljoin(url, a["href"])
            # Assume a <span> with class "event-date" holds the date/time info.
            date_elem = event.find("span", class_="event-date")
            event_datetime = date_elem.get_text(strip=True) if date_elem else ""
            events.append({
                "title": event_title,
                "url": event_url,
                "datetime": event_datetime
            })
            if len(events) >= 5:  # Limit to first 5 events
                break
    return events

def scrape_oxford():
    data = {
        "name": "University of Oxford",
        "url": BASE_URL,
        "graduate_courses": scrape_graduate_courses(),
        "graduate_colleges": scrape_graduate_colleges(),
        "undergraduate_courses": scrape_undergraduate_courses(),
        "undergraduate_colleges": scrape_undergraduate_colleges(),
        "events": scrape_events()
    }
    return data

if __name__ == "__main__":
    result = scrape_oxford()
    print(json.dumps(result, indent=4))
