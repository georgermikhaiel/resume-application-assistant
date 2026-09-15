import type { JobPosting } from "../domain/models.js";

export const MOCK_POSTINGS: JobPosting[] = [
  {
    id: "software-development", company: "Northstar Robotics", role: "Software Engineering Intern", location: "Edmonton, AB", term: "Winter 2027 - 4 months", deadline: "2026-10-15", posted: "2026-09-05", url: "https://mock.local/northstar-robotics/software-engineering-intern", source: "mock-local",
    description: "Join a software development team building web and backend tools. The role values TypeScript, JavaScript, Git, API design, debugging, automated testing, and clear collaboration with engineers."
  },
  {
    id: "data-ml", company: "Prairie Analytics", role: "Data Science and Machine Learning Intern", location: "Calgary, AB", term: "Summer 2027 - 8 months", deadline: "2026-11-01", posted: "2026-09-02", url: "https://mock.local/prairie-analytics/data-science-intern", source: "mock-local",
    description: "Support applied machine learning and analytics projects with Python, Pandas, NumPy, scikit-learn, model evaluation, cross-validation, feature engineering, and clear communication of limitations."
  },
  {
    id: "qa-automation", company: "CivicStack", role: "QA and Test Automation Intern", location: "Vancouver, BC", term: "Winter 2027 - 4 months", deadline: "2026-10-22", posted: "2026-09-08", url: "https://mock.local/civicstack/qa-automation-intern", source: "mock-local",
    description: "Help with functional testing, regression testing, test validation, defect reporting, Jira workflows, and automation for software releases. Strong written communication and careful debugging are important."
  },
  {
    id: "unsupported-technologies", company: "Orbit Cloud", role: "Platform Engineering Intern", location: "Toronto, ON", term: "Summer 2027 - 8 months", deadline: "2026-11-15", posted: "2026-09-10", url: "https://mock.local/orbit-cloud/platform-engineering-intern", source: "mock-local",
    description: "Build cloud infrastructure with Rust, Go, Kubernetes, Terraform, Docker, AWS, PostgreSQL, and React. Applicants should have production experience operating distributed systems."
  }
];
