import sys
import json
import argparse
import re
import pandas as pd
from jobspy import scrape_jobs

AVAILABLE_SITES = ["indeed", "linkedin", "google", "zip_recruiter", "glassdoor", "bayt", "naukri", "bdjobs"]
DEFAULT_SITES = ["indeed", "linkedin"]
FALLBACK_SITES = ["indeed", "linkedin"]
PROBLEMATIC_SITES = {"zip_recruiter", "glassdoor", "bayt", "naukri", "bdjobs"}

COUNTRY_ALIASES = {
    "india": "India",
    "in": "India",
    "usa": "USA",
    "us": "USA",
    "uk": "UK",
    "united kingdom": "UK",
    "canada": "Canada",
    "australia": "Australia",
    "germany": "Germany",
    "singapore": "Singapore",
    "uae": "UAE",
    "saudi arabia": "Saudi Arabia",
}

def normalize_country(country):
    if not country:
        return "USA"
    normalized = country.strip().lower()
    return COUNTRY_ALIASES.get(normalized, country.strip().title())

def build_site_candidates(selected_sites, country):
    if country.lower() == "india":
        safe_sites = [site for site in selected_sites if site not in PROBLEMATIC_SITES]
        if safe_sites:
            return [safe_sites, FALLBACK_SITES]
        return [FALLBACK_SITES]

    if any(site in selected_sites for site in PROBLEMATIC_SITES):
        return [selected_sites, [site for site in selected_sites if site not in PROBLEMATIC_SITES], FALLBACK_SITES]
    return [selected_sites]

def sanitize_for_json(data):
    if isinstance(data, dict):
        return {k: sanitize_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_for_json(v) for v in data]
    elif pd.isna(data):
        return None
    else:
        return data

def main():
    parser = argparse.ArgumentParser(description="Headless Job Scraper")
    parser.add_argument("--search_term", type=str, default="software engineer")
    parser.add_argument("--location", type=str, default="San Francisco, CA")
    parser.add_argument("--country", type=str, default="USA")
    parser.add_argument("--google_query", type=str, default="")
    parser.add_argument("--results_wanted", type=int, default=20)
    parser.add_argument("--hours_old", type=int, default=72)
    parser.add_argument("--sites", type=str, default="indeed,linkedin")

    args = parser.parse_args()

    selected_sites = [s.strip().lower() for s in args.sites.split(",") if s.strip()]
    if not selected_sites:
        selected_sites = DEFAULT_SITES

    normalized_country = normalize_country(args.country)
    site_candidates = build_site_candidates(selected_sites, normalized_country)

    jobs = None
    last_error = None

    for site_group in site_candidates:
        try:
            jobs = scrape_jobs(
                site_name=site_group,
                search_term=args.search_term,
                google_search_term=args.google_query or f"{args.search_term} jobs near {args.location} since yesterday",
                location=args.location or f"{args.search_term} {normalized_country}",
                results_wanted=args.results_wanted,
                hours_old=args.hours_old,
                country_indeed=normalized_country or "USA",
            )
            break
        except Exception as exc:
            last_error = str(exc)

    if jobs is None or (hasattr(jobs, "empty") and jobs.empty):
        if last_error:
            sys.stderr.write(f"Scrape warning/error: {last_error}\n")
        print(json.dumps([]))
        return

    # Serialize dataframe to JSON and output via stdout
    if hasattr(jobs, "to_dict"):
        jobs_list = jobs.to_dict(orient="records")
    elif isinstance(jobs, list):
        jobs_list = jobs
    else:
        jobs_list = []

    sanitized = sanitize_for_json(jobs_list)
    print(json.dumps(sanitized, default=str))

if __name__ == "__main__":
    main()
