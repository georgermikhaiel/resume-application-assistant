export const KNOWN_TECHNOLOGIES = [
  "Apache ECharts", "scikit-learn", "TypeScript", "JavaScript", "Python", "Java", "Bash", "HTML", "CSS",
  "Pandas", "NumPy", "XGBoost", "LightGBM", "TF-IDF", "Salesforce", "GitHub", "Git", "Linux", "Jira", "Confluence",
  "Rust", "Kubernetes", "Terraform", "Docker", "PostgreSQL", "React", "Node.js", "GraphQL", "Playwright", "Cypress",
  "PyTorch", "TensorFlow", "SQL", "AWS", "Azure", "GCP", "Go"
] as const;

function termPattern(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return term.length <= 2 ? new RegExp(`\\b${escaped}\\b`, "i") : new RegExp(`\\b${escaped}(?:\\b|(?=[^A-Za-z0-9]|$))`, "i");
}

export function normalizeTechnology(value: string): string {
  return value.trim().toLowerCase().replace(/[.\-\s]+/g, "");
}

export function extractMentionedTechnologies(text: string): string[] {
  return KNOWN_TECHNOLOGIES.filter((term) => termPattern(term).test(text));
}

export function technologySet(values: string[]): Set<string> {
  return new Set(values.map(normalizeTechnology));
}
