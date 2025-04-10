import requests
from bs4 import BeautifulSoup
import json

def scrape_program_tables():
    url = "https://www.ensia.edu.dz/program/"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/113.0.0.0 Safari/537.36"
        )
    }
    
    # Fetch the page content
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Find all tables with the class "tg"
    tables = soup.find_all("table", class_="tg")
    if not tables:
        print("Error: No program tables found!")
        return None

    all_data = []
    
    # Define the keys for our JSON data.
    columns = [
        "unite_enseignement",         # Unité d’Enseignement
        "VHS",                        # VHS (C/TD/TP)
        "VHH_total",                  # VHH Total (C/TD/TP)
        "VH_hebdo_C",                 # V.H. Hebdomadaire - C
        "VH_hebdo_TD",                # V.H. Hebdomadaire - TD
        "VH_hebdo_TP",                # V.H. Hebdomadaire - TP
        "VH_hebdo_Travail_Personnel", # V.H. Hebdomadaire - Travail Personnel
        "Coef",                       # Coef
        "Credits",                    # Crédits
        "Mode_evaluation_Continu",    # Mode d’évaluation - Continu
        "Mode_evaluation_Examen"      # Mode d’évaluation - Examen
    ]

    for table in tables:
        data = []
        tbody = table.find("tbody")
        if not tbody:
            print("Error: Table body not found!")
            continue

        for tr in tbody.find_all("tr"):
            row = {}
            tds = tr.find_all("td")
            for idx, td in enumerate(tds):
                if idx >= len(columns):
                    break
                a_tag = td.find("a")
                if a_tag:
                    cell_data = {
                        "text": a_tag.get_text(strip=True),
                        "link": a_tag.get("href", "").strip()
                    }
                else:
                    cell_data = td.get_text(strip=True)
                row[columns[idx]] = cell_data
            data.append(row)
        
        all_data.append(data)

    return all_data

if __name__ == '__main__':
    program_data = scrape_program_tables()
    if program_data:
        output_file = "ensia_programs.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(program_data, f, ensure_ascii=False, indent=4)
        print(f"Program data has been saved to '{output_file}'")