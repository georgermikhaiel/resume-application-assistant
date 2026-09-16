interface ChromeEvent {
  addListener(listener: (...args: never[]) => void): void;
}

interface ChromeTab { id?: number; url?: string; }

interface ChromeNamespace {
  identity: { getAuthToken(details: { interactive: boolean }): Promise<string | { token?: string; grantedScopes?: string[] }>; removeCachedAuthToken(details: { token: string }): Promise<void> };
  action: { onClicked: ChromeEvent };
  runtime: { onInstalled: ChromeEvent; getManifest(): { oauth2?: { client_id?: string; scopes?: string[] } } };
  sidePanel: { setPanelBehavior(options: { openPanelOnActionClick: boolean }): Promise<void> };
  tabs: { query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<ChromeTab[]> };
  scripting: { executeScript<T>(details: { target: { tabId: number }; func: () => T }): Promise<Array<{ result?: T }>> };
  storage: { local: { get(keys?: string[]): Promise<Record<string, unknown>>; set(items: Record<string, unknown>): Promise<void>; remove(keys?: string[]): Promise<void> } };
}

declare const chrome: ChromeNamespace;
