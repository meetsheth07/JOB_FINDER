import re
import threading
import tkinter as tk
from tkinter import ttk, messagebox

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


class JobScraperApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Job Scraper")
        self.root.geometry("700x580")
        self.root.resizable(False, False)

        tk.Label(root, text="Job Scraper", font=("Segoe UI", 16, "bold")).pack(pady=(12, 8))
        tk.Label(root, text="Enter your search details and run the scraper.", font=("Segoe UI", 10)).pack()

        form = ttk.Frame(root, padding=12)
        form.pack(fill="x")

        self.fields = {}
        self._add_field(form, "Search term", "search_term", "software engineer")
        self._add_field(form, "Location", "location", "San Francisco, CA")
        self._add_field(form, "Country", "country", "USA")
        self._add_field(form, "Google query", "google_query", "software engineer jobs near San Francisco, CA since yesterday")
        self._add_field(form, "Results wanted", "results_wanted", "20")
        self._add_field(form, "Hours old", "hours_old", "72")

        sites_frame = ttk.LabelFrame(form, text="Sites", padding=8)
        sites_frame.grid(row=6, column=0, columnspan=2, sticky="ew", pady=(8, 0))
        ttk.Label(sites_frame, text="Select one or more sources. Some sites may require a proxy or may block requests.", wraplength=620).pack(anchor="w", pady=(0, 6))
        self.site_vars = {}
        for site_name in AVAILABLE_SITES:
            var = tk.BooleanVar(value=site_name in DEFAULT_SITES)
            self.site_vars[site_name] = var
            ttk.Checkbutton(sites_frame, text=site_name.replace("_", " ").title(), variable=var).pack(anchor="w")

        button_frame = ttk.Frame(root, padding=(12, 8))
        button_frame.pack(fill="x")
        self.run_button = ttk.Button(button_frame, text="Find Jobs", command=self.start_scrape)
        self.run_button.pack(side="left")
        self.status_var = tk.StringVar(value="Ready")
        ttk.Label(button_frame, textvariable=self.status_var, foreground="#1f4f8b").pack(side="left", padx=(12, 0))

        output_frame = ttk.LabelFrame(root, text="Output", padding=8)
        output_frame.pack(fill="both", expand=True, padx=12, pady=(0, 12))
        self.output_box = tk.Text(output_frame, height=12, wrap="word")
        self.output_box.pack(fill="both", expand=True)
        self.output_box.insert("1.0", "Results will appear here.\n")
        self.output_box.configure(state="disabled")

    def _add_field(self, parent, label_text, key, default_value):
        row = len(self.fields) // 2
        col = (len(self.fields) % 2) * 2
        ttk.Label(parent, text=label_text).grid(row=row, column=col, sticky="w", padx=(0, 8), pady=6)
        entry = ttk.Entry(parent, width=28)
        entry.grid(row=row, column=col + 1, sticky="ew", padx=(0, 12), pady=6)
        entry.insert(0, default_value)
        self.fields[key] = entry
        parent.columnconfigure(col + 1, weight=1)

    def start_scrape(self):
        self.run_button.config(state="disabled")
        self.status_var.set("Scraping...")
        self._set_output("Starting scrape...\n")
        threading.Thread(target=self._run_scrape, daemon=True).start()

    def _run_scrape(self):
        try:
            search_term = self.fields["search_term"].get().strip()
            location = self.fields["location"].get().strip()
            country = self.fields["country"].get().strip()
            google_query = self.fields["google_query"].get().strip()
            results_wanted = int(self.fields["results_wanted"].get().strip() or 10)
            hours_old = int(self.fields["hours_old"].get().strip() or 72)

            selected_sites = [name for name, var in self.site_vars.items() if var.get()]
            if not selected_sites:
                raise ValueError("Please select at least one site.")

            normalized_country = self._normalize_country(country)
            site_candidates = self._build_site_candidates(selected_sites, normalized_country)
            last_error = None

            for site_group in site_candidates:
                try:
                    jobs = scrape_jobs(
                        site_name=site_group,
                        search_term=search_term,
                        google_search_term=google_query or f"{search_term} jobs near {location} since yesterday",
                        location=location or f"{search_term} {normalized_country}",
                        results_wanted=results_wanted,
                        hours_old=hours_old,
                        country_indeed=normalized_country or "USA",
                    )
                    self.root.after(0, lambda jobs=jobs: self._handle_success(jobs))
                    return
                except Exception as exc:
                    last_error = str(exc)

            raise RuntimeError(last_error or "No jobs could be fetched from the selected sources.")
        except Exception as exc:
            self.root.after(0, lambda: self._handle_error(str(exc)))

    def _normalize_country(self, country):
        if not country:
            return "USA"
        normalized = country.strip().lower()
        return COUNTRY_ALIASES.get(normalized, country.strip().title())

    def _build_site_candidates(self, selected_sites, country):
        if country.lower() == "india":
            safe_sites = [site for site in selected_sites if site not in PROBLEMATIC_SITES]
            if safe_sites:
                return [safe_sites, FALLBACK_SITES]
            return [FALLBACK_SITES]

        if any(site in selected_sites for site in PROBLEMATIC_SITES):
            return [selected_sites, [site for site in selected_sites if site not in PROBLEMATIC_SITES], FALLBACK_SITES]
        return [selected_sites]

    def _handle_success(self, jobs):
        job_count = len(jobs) if jobs is not None else 0
        self._set_output(f"Found {job_count} jobs.\n")
        self.status_var.set(f"Done — {job_count} jobs found")
        self.run_button.config(state="normal")
        messagebox.showinfo("Success", f"Found {job_count} jobs.")

    def _handle_error(self, error_message):
        self._set_output(f"Error: {error_message}\n")
        self.status_var.set("Failed")
        self.run_button.config(state="normal")
        messagebox.showerror("Scrape failed", error_message)

    def _set_output(self, message):
        self.output_box.configure(state="normal")
        self.output_box.delete("1.0", "end")
        self.output_box.insert("end", message)
        self.output_box.configure(state="disabled")


def main():
    root = tk.Tk()
    JobScraperApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()