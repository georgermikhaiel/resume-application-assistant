// This file runs in the active page's isolated content-script world. It neither
// reads remote data nor submits a form; the service worker supplies local data.
type ProfileField = "fullName" | "firstName" | "lastName" | "email" | "phone" | "location" | "linkedin" | "github";

interface LocalProfile { fullName: string; firstName: string; lastName: string; email: string; phone: string; location: string; linkedin: string; github: string; }
interface Candidate { field: ProfileField; label: string; matchedBy: string; hasExistingValue: boolean; }
interface MatchedField extends Candidate { element: HTMLInputElement | HTMLTextAreaElement; }

const installed = "__careerApplicationAutofillInstalled";
if (!(window as unknown as Record<string, boolean>)[installed]) {
  (window as unknown as Record<string, boolean>)[installed] = true;

  const patterns: Record<ProfileField, RegExp> = {
    fullName: /\b(full|legal|candidate)\s*name\b|^name$/i,
    firstName: /\b(first|given|preferred)\s*name\b/i,
    lastName: /\b(last|family|sur)\s*name\b/i,
    email: /\be-?mail\b/i,
    phone: /\b(phone|mobile|telephone|cell)\b/i,
    location: /\b(location|city|current\s*(address|location))\b/i,
    linkedin: /\blinked\s*in\b/i,
    github: /\b(git\s*hub|portfolio|personal\s*(site|website))\b/i
  };

  function usable(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
    if (element instanceof HTMLTextAreaElement) return !element.disabled && !element.readOnly;
    if (!(element instanceof HTMLInputElement) || element.disabled || element.readOnly) return false;
    return !["hidden", "password", "file", "submit", "button", "reset", "checkbox", "radio", "date", "time"].includes(element.type);
  }

  function accessibleText(element: HTMLInputElement | HTMLTextAreaElement): string {
    const explicitLabel = element.id ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(element.id)}"]`)?.textContent : "";
    const wrappedLabel = element.closest("label")?.textContent ?? "";
    const labelledBy = (element.getAttribute("aria-labelledby") ?? "").split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" ");
    const group = element.closest("fieldset")?.querySelector("legend")?.textContent ?? "";
    return [explicitLabel, wrappedLabel, labelledBy, group, element.getAttribute("aria-label"), element.placeholder, element.name, element.id, element.autocomplete].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  }

  function findCandidates(): { matches: MatchedField[]; skipped: number } {
    const matches: MatchedField[] = [];
    let skipped = 0;
    for (const element of Array.from(document.querySelectorAll("input, textarea"))) {
      if (!usable(element)) { skipped += 1; continue; }
      const text = accessibleText(element);
      const field = (Object.keys(patterns) as ProfileField[]).find((key) => patterns[key].test(text));
      if (!field) continue;
      // A specific name match takes precedence over the generic full-name match.
      const specific: ProfileField = field === "fullName"
        ? (patterns.firstName.test(text) ? "firstName" : patterns.lastName.test(text) ? "lastName" : field)
        : field;
      matches.push({ field: specific, label: text || element.name || element.id || "Unlabelled field", matchedBy: text || "element metadata", hasExistingValue: Boolean(element.value.trim()), element });
    }
    return { matches, skipped };
  }

  function publicCandidate(match: MatchedField): Candidate {
    const { element: _element, ...candidate } = match;
    return candidate;
  }

  function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (!setter) throw new Error("This field cannot be updated safely.");
    setter.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    const request = message as { type?: string; profile?: LocalProfile; fields?: ProfileField[] };
    if (request.type !== "autofill:inspect" && request.type !== "autofill:apply") return;
    const found = findCandidates();
    if (request.type === "autofill:apply") {
      const allowed = new Set(request.fields ?? []);
      for (const match of found.matches) {
        const value = request.profile?.[match.field];
        if (allowed.has(match.field) && value) setNativeValue(match.element, value);
      }
    }
    sendResponse({ candidates: found.matches.map(publicCandidate), skipped: found.skipped });
  });
}
