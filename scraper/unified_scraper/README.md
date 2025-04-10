# Unified University Scraper

This is a unified scraper that combines functionality from multiple university website scrapers. It currently supports scraping news, events, and program information from:

- University of El Oued (www.univ-eloued.dz)
- ENSIA (www.ensia.edu.dz)
- University of Ghardaia (www.univ-ghardaia.edu.dz)
- MIT (web.mit.edu)

## Features

- Scrapes news articles from all universities
- Scrapes events and announcements
- Scrapes program information, faculties, and schedules
- Saves all data in a single unified JSON file with a consistent structure
- Includes comprehensive error handling and logging
- Organized output with timestamps
- Robust retry mechanism with exponential backoff
- Session management for better performance

## Installation

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

## Usage

Simply run the main script:
```bash
python unified_scraper.py
```

The script will:
1. Scrape news, events, and program data from all universities
2. Combine all data into a single unified JSON file with a consistent structure
3. Save the unified data with a timestamp in the same directory as the script
4. Log all activities to both console and a log file

## Data Structure

The unified data is saved in a single JSON file with the following structure:

```json
{
  "universities": [
    {
      "name": "University of El Oued",
      "url": "https://www.univ-eloued.dz/en/",
      "faculties": [...],
      "departments": [],
      "specialties": [],
      "news": [...],
      "events": [...]
    },
    {
      "name": "ENSIA",
      "url": "https://www.ensia.edu.dz",
      "faculties": [],
      "departments": [],
      "specialties": [...],
      "news": [...],
      "events": []
    },
    {
      "name": "University of Ghardaia",
      "url": "https://www.univ-ghardaia.edu.dz/en/",
      "faculties": [...],
      "departments": [],
      "specialties": [],
      "news": [],
      "events": [...]
    },
    {
      "name": "MIT",
      "url": "https://web.mit.edu/education/schools-and-departments/",
      "faculties": [...],
      "departments": [...],
      "specialties": [...],
      "news": [...],
      "events": [...]
    }
  ],
  "metadata": {
    "scraped_at": "2023-04-09T12:34:56.789012",
    "version": "1.0",
    "total_universities": 4
  }
}
```

## Output Structure

The scraper creates the following files in the same directory as the script:
```
unified_university_data_YYYYMMDD_HHMMSS.json
scraper.log
```

## Error Handling

The scraper includes comprehensive error handling and logging:
- All errors are logged with timestamps and appropriate error messages
- If a particular scrape fails, the script will continue with the remaining tasks
- Retry mechanism with exponential backoff for network requests
- Detailed logging to both console and file
- Graceful handling of missing elements or unexpected page structures

## Extending the Scraper

To add a new university:
1. Create a new class that inherits from `BaseScraper`
2. Implement the required scraping methods
3. Add the new scraper to the list in the `main()` function

## Dependencies

- requests
- beautifulsoup4
- httpx
- feedparser

See requirements.txt for specific versions. 