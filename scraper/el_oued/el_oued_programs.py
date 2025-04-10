import os
import re
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def scrape_and_save_faculty_schedule(base_url):
    # Define the faculties timetable route
    faculties_path = "tim_tab/"
    faculties_url = urljoin(base_url, faculties_path)
    
    try:
        response = requests.get(faculties_url)
        response.raise_for_status()
    except Exception as err:
        print(f"Error fetching faculties timetable page: {err}")
        return
    
    soup = BeautifulSoup(response.content, "html.parser")
    
    # Find all links that match the pattern of individual faculty schedule pages.
    faculty_links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "/faculty/" in href and "schedules" in href:
            full_url = urljoin(base_url, href)
            faculty_links.add(full_url)
    
    if not faculty_links:
        print("No faculty schedule links found at:", faculties_url)
        return
    
    # Create an output directory (optional)
    output_dir = "faculty_schedules"
    os.makedirs(output_dir, exist_ok=True)
    
    for faculty_url in sorted(faculty_links):
        print(f"\nProcessing Faculty Page: {faculty_url}")
        try:
            fac_response = requests.get(faculty_url)
            fac_response.raise_for_status()
        except Exception as err:
            print(f"Error fetching faculty page {faculty_url}: {err}")
            continue
        
        fac_soup = BeautifulSoup(fac_response.content, "html.parser")
        
        # Attempt to get a friendly faculty name from an <h1> tag
        faculty_name_tag = fac_soup.find("h1")
        if faculty_name_tag:
            faculty_name = faculty_name_tag.get_text(strip=True)
        else:
            # Fallback: extract faculty id from URL
            parts = faculty_url.strip("/").split("/")
            faculty_name = parts[-2] if len(parts) >= 2 else "faculty"
        
        faculty_name = faculty_name.strip()
        print("Faculty Name:", faculty_name)
        
        # Initialize a list to store specialties info
        specialties = []
        
        # Find accordion items (each representing a specialty)
        accordion_items = fac_soup.find_all("div", class_="accordion-item")
        if not accordion_items:
            print("No specialties found on this faculty page.")
            continue
        
        for item in accordion_items:
            button = item.find("button", class_="accordion-button")
            if button:
                specialty_name = button.get_text(strip=True)
                # Use data-bs-target for the in-page anchor if present
                anchor_target = button.get("data-bs-target", "")
                if anchor_target:
                    # Remove any extra '/' if needed before appending the fragment
                    specialty_url = faculty_url.rstrip("/") + anchor_target
                else:
                    specialty_url = faculty_url
                    
                specialty_dict = {
                    "specialty_name": specialty_name,
                    "specialty_url": specialty_url
                }
                
                # Now, try to fetch the specialty page to extract the timetable PDF link.
                try:
                    spec_response = requests.get(specialty_url)
                    spec_response.raise_for_status()
                    spec_soup = BeautifulSoup(spec_response.content, "html.parser")
                    
                    # Locate the list item row containing the PDF timetable link.
                    # This uses a simple search for an <a> tag with an href ending with ".pdf".
                    pdf_anchor = spec_soup.find("a", href=re.compile(r'\.pdf$'))
                    if pdf_anchor:
                        # Convert relative URL to absolute.
                        pdf_link = urljoin(faculty_url, pdf_anchor["href"])
                        specialty_dict["timetable"] = pdf_link
                        print(f"Found timetable for {specialty_name}: {pdf_link}")
                    else:
                        print(f"No timetable PDF link found for {specialty_name}")
                except Exception as err:
                    print(f"Error fetching specialty page {specialty_url}: {err}")
                
                specialties.append(specialty_dict)
        
        # Save the specialties data into a JSON file,
        # using the faculty name as the file name (sanitized).
        filename = f"{faculty_name}.json"
        file_path = os.path.join(output_dir, filename)
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(specialties, f, ensure_ascii=False, indent=4)
            print(f"Saved {len(specialties)} specialties to {file_path}")
        except Exception as err:
            print(f"Error writing to file {file_path}: {err}")

if __name__ == '__main__':
    base_url = "https://www.univ-eloued.dz/en/"
    scrape_and_save_faculty_schedule(base_url)
