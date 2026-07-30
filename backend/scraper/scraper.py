import sys
import json
import csv
import argparse
import re
import os
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

def job_requires_experience_text(text):
    if not text:
        return False
    text = str(text).lower()
    no_experience_markers = [
        "no prior experience required",
        "no experience required",
        "no experience needed",
        "entry level",
        "entry-level",
        "fresher",
        "fresh graduate",
        "graduate",
        "junior",
        "internship",
        "intern",
    ]
    if any(marker in text for marker in no_experience_markers):
        return False

    if re.search(r"\b(?:\d+|one|two|three|four|five)\s*(?:\+)?\s*(?:years?|yrs?|yr)\b", text):
        return True

    return "prior experience" in text or ("experience" in text and ("requires" in text or "minimum" in text or "at least" in text))

def filter_jobs_by_experience(jobs, only_no_experience):
    if not only_no_experience or jobs is None:
        return jobs

    if hasattr(jobs, "columns"):
        text_columns = [
            col for col in ("description", "job_description", "summary", "requirements", "title", "job_title", "role", "position")
            if col in jobs.columns
        ]
        if not text_columns:
            return jobs

        text_series = jobs[text_columns].fillna("").astype(str).agg(lambda row: " ".join(row), axis=1)
        mask = text_series.apply(job_requires_experience_text)
        return jobs[~mask]

    if isinstance(jobs, (list, tuple)):
        return [job for job in jobs if not job_requires_experience_text(" ".join(str(v) for v in job.values()))]

    return jobs

def sanitize_for_json(data):
    if isinstance(data, dict):
        return {k: sanitize_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_for_json(v) for v in data]
    elif pd.isna(data):
        return None
    else:
        return data

def extract_job_links(jobs):
    if not hasattr(jobs, "columns"):
        return []
    for col in ("job_url", "url", "link", "job_link", "job_urls", "job_post_url", "job_posting_url"):
        if col in jobs.columns:
            return [str(link) for link in jobs[col].dropna().tolist()]
    return []

def main():
    parser = argparse.ArgumentParser(description="Headless Job Scraper")
    parser.add_argument("--search_term", type=str, default="software engineer")
    parser.add_argument("--location", type=str, default="San Francisco, CA")
    parser.add_argument("--country", type=str, default="USA")
    parser.add_argument("--google_query", type=str, default="")
    parser.add_argument("--results_wanted", type=int, default=20)
    parser.add_argument("--hours_old", type=int, default=72)
    parser.add_argument("--sites", type=str, default="indeed,linkedin")
    parser.add_argument("--only_no_experience", action="store_true")
    parser.add_argument("--csv_path", type=str, default="")

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
            jobs = filter_jobs_by_experience(jobs, args.only_no_experience)
            break
        except Exception as exc:
            last_error = str(exc)

    if jobs is None or (hasattr(jobs, "empty") and jobs.empty):
        if last_error:
            sys.stderr.write(f"Scrape warning/error: {last_error}\n")
        print(json.dumps([]))
        return

    # Extract links and save to jobs.csv if requested/default
    links = extract_job_links(jobs)
    csv_target = args.csv_path or "jobs.csv"
    try:
        with open(csv_target, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            for link in links:
                writer.writerow([link])
    except Exception as e:
        sys.stderr.write(f"CSV save warning: {str(e)}\n")

    # Format dataframe/dict to JSON
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
