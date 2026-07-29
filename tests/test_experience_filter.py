import unittest

from main import JobScraperApp


class ExperienceFilterTests(unittest.TestCase):
    def setUp(self):
        self.app = JobScraperApp.__new__(JobScraperApp)

    def test_filters_out_jobs_that_require_experience(self):
        jobs = [
            {"title": "Software Engineer", "description": "Requires 3 years of experience in Python."},
            {"title": "Junior Developer", "description": "No prior experience required. Entry-level role."},
            {"title": "Data Analyst", "description": "Fresh graduate opportunity."},
        ]

        filtered_jobs = self.app._filter_jobs_by_experience(jobs, True)

        self.assertEqual(len(filtered_jobs), 2)
        self.assertEqual(filtered_jobs[0]["title"], "Junior Developer")
        self.assertEqual(filtered_jobs[1]["title"], "Data Analyst")

    def test_leaves_jobs_alone_when_filter_is_disabled(self):
        jobs = [{"title": "Software Engineer", "description": "Requires 3 years of experience in Python."}]

        filtered_jobs = self.app._filter_jobs_by_experience(jobs, False)

        self.assertEqual(filtered_jobs, jobs)


if __name__ == "__main__":
    unittest.main()
