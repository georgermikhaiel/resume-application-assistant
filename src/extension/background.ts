chrome.runtime.onInstalled.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.action.onClicked.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

export interface LocalProfile {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

export interface AutofillCandidate {
  field: keyof LocalProfile;
  label: string;
  matchedBy: string;
  hasExistingValue: boolean;
}

interface AutofillResponse {
  candidates: AutofillCandidate[];
  skipped: number;
}

const DEFAULT_PROFILE: LocalProfile = {
  fullName: "George Mikhaiel",
  firstName: "George",
  lastName: "Mikhaiel",
  email: "George.r.mikhaiel@gmail.com",
  phone: "",
  location: "Edmonton, AB",
  linkedin: "https://linkedin.com/in/george-mikhaiel-44828b313",
  github: "https://github.com/georgermikhaiel"
};

async function getLocalProfile(): Promise<LocalProfile> {
  const stored = await chrome.storage.local.get(["applicationProfile"]);
  const saved = stored.applicationProfile;
  if (saved && typeof saved === "object") return { ...DEFAULT_PROFILE, ...(saved as Partial<LocalProfile>) };
  await chrome.storage.local.set({ applicationProfile: DEFAULT_PROFILE });
  return DEFAULT_PROFILE;
}

async function activeTabId(): Promise<number> {
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  if (!tab?.id) throw new Error("No active tab was found.");
  if (!tab.url || !/^https?:/i.test(tab.url)) throw new Error("Open a web application form before using form assistance.");
  return tab.id;
}

async function sendToFormScript<T>(message: unknown): Promise<T> {
  const tabId = await activeTabId();
  // activeTab grants this temporary, user-initiated injection. The file is idempotent.
  await chrome.scripting.executeScript({ target: { tabId }, files: ["form-autofill.js"] });
  return chrome.tabs.sendMessage<T>(tabId, message);
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!message || typeof message !== "object") return;
  const request = message as { type?: string; fields?: Array<keyof LocalProfile> };
  if (request.type !== "autofill:preview" && request.type !== "autofill:apply") return;
  void (async () => {
    try {
      const profile = await getLocalProfile();
      if (request.type === "autofill:preview") {
        sendResponse(await sendToFormScript<AutofillResponse>({ type: "autofill:inspect" }));
      } else {
        const fields = request.fields ?? [];
        sendResponse(await sendToFormScript<AutofillResponse>({ type: "autofill:apply", profile, fields }));
      }
    } catch (error: unknown) {
      sendResponse({ error: error instanceof Error ? error.message : "Form assistance failed." });
    }
  })();
  return true;
});
