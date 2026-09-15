interface ChromeEvent {
  addListener(listener: (...args: never[]) => void): void;
}

interface ChromeTab { id?: number; url?: string; }

interface ChromeNamespace {
  action: { onClicked: ChromeEvent };
  runtime: { onInstalled: ChromeEvent };
  sidePanel: { setPanelBehavior(options: { openPanelOnActionClick: boolean }): Promise<void> };
  tabs: { query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<ChromeTab[]> };
  scripting: { executeScript<T>(details: { target: { tabId: number }; func: () => T }): Promise<Array<{ result?: T }>> };
  storage: { local: { get(keys?: string[]): Promise<Record<string, unknown>>; set(items: Record<string, unknown>): Promise<void> } };
}

declare const chrome: ChromeNamespace;
