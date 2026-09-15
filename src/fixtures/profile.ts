import type { VerifiedFact } from "../domain/models.js";

const resumeSource = "George Mikhaiel - verified base résumé PDFs";
const playbookSource = "George_Mikhaiel_2026_Resume_Playbook.docx";

export const FACT_BANK: VerifiedFact[] = [
  {
    id: "contact.name", category: "contact", section: "Header", text: "George Mikhaiel",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / header" }, technologies: [], metrics: [], ownership: "solo", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: { general: 1 }, eligibleForResume: true
  },
  {
    id: "contact.location", category: "contact", section: "Header", text: "Edmonton, AB",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / header" }, technologies: [], metrics: [], ownership: "solo", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: { general: 1 }, eligibleForResume: true
  },
  {
    id: "contact.email", category: "contact", section: "Header", text: "George.r.mikhaiel@gmail.com",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / header" }, technologies: [], metrics: [], ownership: "solo", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: { general: 1 }, eligibleForResume: true
  },
  {
    id: "contact.links", category: "contact", section: "Header", text: "linkedin.com/in/george-mikhaiel-44828b313 | github.com/georgermikhaiel",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / header" }, technologies: ["GitHub"], metrics: [], ownership: "solo", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: { general: 1 }, eligibleForResume: true
  },
  {
    id: "education.ualberta-degree", category: "education", section: "Education", title: "University of Alberta | BSc - Computing Science (Artificial Intelligence) | Sep 2024 - Apr 2028",
    text: "University of Alberta - BSc, Computing Science (Artificial Intelligence), Sep 2024 - Apr 2028",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / Education" }, technologies: [], metrics: [], ownership: "solo", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: { software: 4, "data-ml": 5, qa: 4, general: 5 }, eligibleForResume: true
  },
  {
    id: "education.coursework", category: "education", section: "Education",
    text: "Relevant coursework includes Algorithms and Data Structures, Practical Programming Methodology, Introduction to Artificial Intelligence, Machine Learning Foundations, and Software Engineering.",
    source: { document: resumeSource, locator: "Data Science and Machine Learning and Software Development résumé PDFs / Education" }, technologies: [], metrics: [], ownership: "solo", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: { software: 3, "data-ml": 4, qa: 2, general: 2 }, eligibleForResume: true
  },
  {
    id: "skills.software", category: "skill", section: "Technical Skills", title: "Languages and Scripting", text: "TypeScript, JavaScript, Python, Java, C, Bash, HTML, CSS",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / Skills" }, technologies: ["TypeScript", "JavaScript", "Python", "Java", "Bash", "HTML", "CSS"], metrics: [], ownership: "solo", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: { software: 5, "data-ml": 4, qa: 4, general: 4 }, eligibleForResume: true
  },
  {
    id: "skills.ml", category: "skill", section: "Technical Skills", title: "Machine Learning and Data", text: "Pandas, NumPy, scikit-learn, XGBoost, LightGBM, TF-IDF, cross-validation, class-imbalance handling",
    source: { document: resumeSource, locator: "Data Science and Machine Learning résumé / Skills" }, technologies: ["Pandas", "NumPy", "scikit-learn", "XGBoost", "LightGBM", "TF-IDF"], metrics: [], ownership: "solo", allowedLanes: ["data-ml", "software", "general"], relevance: { "data-ml": 5, software: 2, general: 2 }, eligibleForResume: true
  },
  {
    id: "skills.qa", category: "skill", section: "Technical Skills", title: "Software Testing and QA", text: "Automated testing, functional testing, regression testing, test validation, defect reporting",
    source: { document: resumeSource, locator: "QA résumé / Skills" }, technologies: ["Jira", "Confluence"], metrics: [], ownership: "solo", allowedLanes: ["qa", "software", "general"], relevance: { qa: 5, software: 2, general: 2 }, eligibleForResume: true
  },
  {
    id: "skills.platforms", category: "skill", section: "Technical Skills", title: "Platforms and Developer Tools", text: "Salesforce, Git, GitHub, Linux, Jira, Confluence, Apache ECharts",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / Skills" }, technologies: ["Salesforce", "Git", "GitHub", "Linux", "Jira", "Confluence", "Apache ECharts"], metrics: [], ownership: "solo", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: { software: 3, "data-ml": 2, qa: 4, general: 4 }, eligibleForResume: true
  },
  {
    id: "experience.research-nine-visualizations", category: "experience", section: "Experience", title: "Research Assistant | University of Alberta | May 2026 - Aug 2026", text: "Developed nine interactive organizational visualizations using JavaScript and Apache ECharts.",
    source: { document: resumeSource, locator: "Software Development and Data Science and Machine Learning résumé PDFs / Experience" }, technologies: ["JavaScript", "Apache ECharts"], metrics: ["nine interactive visualizations"], ownership: "supervised", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: { software: 5, "data-ml": 5, qa: 3, general: 4 }, eligibleForResume: true,
    notes: "The supervisor controlled and prepared the complete dataset. George worked with sample data, led most visualization layout and interaction design, and adjusted sample-data structure for the visual design. Code generation was shared with Codex."
  },
  {
    id: "experience.research-interactions", category: "experience", section: "Experience", title: "Research Assistant | University of Alberta | May 2026 - Aug 2026", text: "Implemented expandable groups, adjacency highlighting, persistent selection, dynamic node sizing, and custom layouts.",
    source: { document: resumeSource, locator: "Software Development résumé / Experience" }, technologies: ["JavaScript", "Apache ECharts"], metrics: [], ownership: "supervised", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: { software: 5, "data-ml": 4, qa: 3, general: 3 }, eligibleForResume: true,
    notes: "Do not claim that George designed or substantially modified the Apache ECharts API."
  },
  {
    id: "experience.research-debugging", category: "experience", section: "Experience", title: "Research Assistant | University of Alberta | May 2026 - Aug 2026", text: "Tested visualization behaviour, adjusted JavaScript, and adapted sample data to resolve layout, spacing, and interaction issues.",
    source: { document: resumeSource, locator: "General and QA résumé PDFs / Experience" }, technologies: ["JavaScript", "Apache ECharts"], metrics: [], ownership: "supervised", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: { software: 4, "data-ml": 4, qa: 5, general: 4 }, eligibleForResume: true,
    notes: "The supervisor prepared the complete dataset; George adjusted sample-data structure for the visual design."
  },
  {
    id: "experience.kemisoft-config", category: "experience", section: "Experience", title: "Salesforce Admin Intern | Kemisoft Group Ltd. | Sep 2024 - Aug 2025", text: "Configured Salesforce objects, fields, Flows, and validation rules according to customer requirements.",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / Experience" }, technologies: ["Salesforce"], metrics: [], ownership: "team", allowedLanes: ["software", "qa", "general"], relevance: { software: 3, qa: 4, general: 4 }, eligibleForResume: true
  },
  {
    id: "experience.kemisoft-testing", category: "experience", section: "Experience", title: "Salesforce Admin Intern | Kemisoft Group Ltd. | Sep 2024 - Aug 2025", text: "Performed functional and regression testing on Salesforce features and configurations.",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / Experience" }, technologies: ["Salesforce"], metrics: [], ownership: "team", allowedLanes: ["software", "qa", "general"], relevance: { software: 3, qa: 5, general: 3 }, eligibleForResume: true
  },
  {
    id: "experience.kemisoft-defects", category: "experience", section: "Experience", title: "Salesforce Admin Intern | Kemisoft Group Ltd. | Sep 2024 - Aug 2025", text: "Documented defects in Jira with reproduction steps and expected versus actual behaviour.",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / Experience" }, technologies: ["Jira"], metrics: [], ownership: "team", allowedLanes: ["qa", "software", "general"], relevance: { qa: 5, software: 3, general: 3 }, eligibleForResume: true
  },
  {
    id: "experience.kemisoft-collaboration", category: "experience", section: "Experience", title: "Salesforce Admin Intern | Kemisoft Group Ltd. | Sep 2024 - Aug 2025", text: "Collaborated with customers, developers, and product staff to clarify reported issues and expected system behaviour.",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / Experience" }, technologies: [], metrics: [], ownership: "team", allowedLanes: ["software", "qa", "general"], relevance: { software: 3, qa: 3, general: 4 }, eligibleForResume: true
  },
  {
    id: "experience.kemisoft-panel", category: "experience", section: "Experience", title: "Salesforce Admin Intern | Kemisoft Group Ltd. | Sep 2024 - Aug 2025", text: "Participated as an invited panelist at Salesforce World Tour in Washington, DC.",
    source: { document: resumeSource, locator: "Software Development, QA, and General résumé PDFs / Experience" }, technologies: ["Salesforce"], metrics: [], ownership: "team", allowedLanes: ["general", "qa"], relevance: { general: 2, qa: 1 }, eligibleForResume: true
  },
  {
    id: "project.kemicard-workflow", category: "project", section: "Projects", title: "Kemicard Adaptive Setup Assistant | TypeScript, Salesforce | Aug 2026 - Present", text: "Built a local TypeScript workflow assistant for guiding and validating a 15-step software installation process.",
    source: { document: resumeSource, locator: "Software Development, QA, and General résumé PDFs / Projects" }, technologies: ["TypeScript", "Salesforce"], metrics: ["15-step software installation process"], ownership: "solo", allowedLanes: ["software", "qa", "general"], relevance: { software: 5, qa: 5, general: 4 }, eligibleForResume: true,
    notes: "Primarily solo local TypeScript prototype; not a deployed production system."
  },
  {
    id: "project.kemicard-controls", category: "project", section: "Projects", title: "Kemicard Adaptive Setup Assistant | TypeScript, Salesforce | Aug 2026 - Present", text: "Implemented schema-validated product configurations, product-identity checks, target verification, approval gates, retry controls, interrupted-run persistence, and evidence reporting.",
    source: { document: resumeSource, locator: "Software Development résumé / Projects" }, technologies: ["TypeScript", "Salesforce"], metrics: [], ownership: "solo", allowedLanes: ["software", "qa", "general"], relevance: { software: 5, qa: 5, general: 4 }, eligibleForResume: true,
    notes: "Live Salesforce execution remained disabled by default."
  },
  {
    id: "project.kemicard-tests", category: "project", section: "Projects", title: "Kemicard Adaptive Setup Assistant | TypeScript, Salesforce | Aug 2026 - Present", text: "Validated the prototype locally through a 96-test general suite and a 20-test adaptive suite while live Salesforce execution remained disabled by default.",
    source: { document: resumeSource, locator: "Software Development, QA, Data Science and Machine Learning, and General résumé PDFs / Projects" }, technologies: ["TypeScript", "Salesforce"], metrics: ["96-test general suite", "20-test adaptive suite"], ownership: "solo", allowedLanes: ["software", "qa", "general"], relevance: { software: 5, qa: 5, general: 4 }, eligibleForResume: true,
    notes: "The test counts must remain in this exact context."
  },
  {
    id: "project.bot-or-not-pipeline", category: "project", section: "Projects", title: "Bot or Not - Machine Learning Hackathon | Python, Pandas, TF-IDF, XGBoost, LightGBM | Apr 2026", text: "Developed a classification pipeline using more than 55 engineered features and TF-IDF representations, with XGBoost and LightGBM models.",
    source: { document: resumeSource, locator: "Data Science and Machine Learning résumé / Projects" }, technologies: ["Python", "Pandas", "TF-IDF", "XGBoost", "LightGBM"], metrics: ["more than 55 engineered features"], ownership: "team", allowedLanes: ["data-ml", "software", "general"], relevance: { "data-ml": 5, software: 3, general: 2 }, eligibleForResume: true
  },
  {
    id: "project.bot-or-not-evaluation", category: "project", section: "Projects", title: "Bot or Not - Machine Learning Hackathon | Apr 2026", text: "Applied cross-validation and class-imbalance handling to compare models and analyze false-positive and false-negative tradeoffs.",
    source: { document: resumeSource, locator: "Data Science and Machine Learning and General résumé PDFs / Projects" }, technologies: ["Python", "XGBoost", "LightGBM"], metrics: [], ownership: "team", allowedLanes: ["data-ml", "software", "general"], relevance: { "data-ml": 5, software: 2, general: 2 }, eligibleForResume: true
  },
  {
    id: "project.bot-or-not-result", category: "project", section: "Projects", title: "Bot or Not - Machine Learning Hackathon | Apr 2026", text: "Tied for the highest French true-positive result with zero false negatives and ranked third for English true positives while identifying model limitations.",
    source: { document: resumeSource, locator: "All four supplied résumé PDFs / Projects" }, technologies: ["Python"], metrics: ["zero false negatives", "third for English true positives"], ownership: "team", allowedLanes: ["data-ml", "general"], relevance: { "data-ml": 5, general: 2 }, eligibleForResume: true,
    notes: "These are category-specific results. Do not describe them as an overall competition win."
  },
  {
    id: "guardrail.research-ownership", category: "guardrail", section: "Experience", text: "The supervisor controlled and prepared the complete research dataset; George used sample data and led most visualization layout and interaction design.",
    source: { document: playbookSource, locator: "Responsible AI and experience portfolio guidance" }, technologies: ["Apache ECharts"], metrics: [], ownership: "supervised", allowedLanes: ["software", "data-ml", "qa", "general"], relevance: {}, eligibleForResume: false,
    notes: "Control fact only; never generate this as an inflated ownership claim."
  },
  {
    id: "guardrail.kemicard-status", category: "guardrail", section: "Projects", text: "Kemicard is a primarily solo local TypeScript prototype, not a deployed production system.",
    source: { document: playbookSource, locator: "AI-assisted technical projects and experience portfolio guidance" }, technologies: ["TypeScript"], metrics: [], ownership: "solo", allowedLanes: ["software", "qa", "general"], relevance: {}, eligibleForResume: false
  }
];
