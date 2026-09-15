import { MOCK_POSTINGS } from "../fixtures/jobs.js";
import type { JobPosting } from "../domain/models.js";

const selector = document.querySelector<HTMLSelectElement>("#fixture-selector");
const page = document.querySelector<HTMLElement>("#application-page");
const company = document.querySelector<HTMLElement>("#company");
const role = document.querySelector<HTMLElement>("#role");
const location = document.querySelector<HTMLElement>("#location");
const term = document.querySelector<HTMLElement>("#term");
const deadline = document.querySelector<HTMLElement>("#deadline");
const posted = document.querySelector<HTMLElement>("#posted");
const description = document.querySelector<HTMLElement>("#job-description");

if (!selector || !page || !company || !role || !location || !term || !deadline || !posted || !description) throw new Error("Mock page is missing required elements.");
const pageElement = page;
const companyElement = company;
const roleElement = role;
const locationElement = location;
const termElement = term;
const deadlineElement = deadline;
const postedElement = posted;
const descriptionElement = description;
for (const posting of MOCK_POSTINGS) { const option = document.createElement("option"); option.value = posting.id; option.textContent = `${posting.company} - ${posting.role}`; selector.append(option); }

function render(posting: JobPosting): void {
  pageElement.dataset.jobCompany = posting.company; pageElement.dataset.jobRole = posting.role; pageElement.dataset.jobLocation = posting.location; pageElement.dataset.jobTerm = posting.term; pageElement.dataset.jobDeadline = posting.deadline; pageElement.dataset.jobPosted = posting.posted; pageElement.dataset.jobUrl = posting.url;
  companyElement.textContent = posting.company; roleElement.textContent = posting.role; locationElement.textContent = posting.location; termElement.textContent = posting.term; deadlineElement.textContent = posting.deadline; postedElement.textContent = posting.posted; descriptionElement.textContent = posting.description;
}

selector.addEventListener("change", () => { const posting = MOCK_POSTINGS.find((item) => item.id === selector.value); if (posting) render(posting); });
render(MOCK_POSTINGS[0]);
