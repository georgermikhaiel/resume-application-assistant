interface ChromeEvent {
  addListener(listener: (...args: never[]) => void): void;
}

interface ChromeTab { id?: number; url?: string; }

interface ChromeNamespace {
  identity: { getAuthToken(details: { interactive: boolean }): Promise<string | { token?: string; grantedScopes?: string[] }>; removeCachedAuthToken(details: { token: string }): Promise<void> };
  action: { onClicked: ChromeEvent };
  runtime: {
    onInstalled: ChromeEvent;
    getManifest(): { oauth2?: { client_id?: string; scopes?: string[] } };
    sendMessage<T>(message: unknown): Promise<T>;
    onMessage: { addListener(listener: (message: unknown, sender: unknown, sendResponse: (response: unknown) => void) => boolean | void): void };
  };
  sidePanel: { setPanelBehavior(options: { openPanelOnActionClick: boolean }): Promise<void> };
  tabs: { query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<ChromeTab[]>; sendMessage<T>(tabId: number, message: unknown): Promise<T> };
  scripting: {
    executeScript<T>(details: { target: { tabId: number }; func: () => T }): Promise<Array<{ result?: T }>>;
    executeScript(details: { target: { tabId: number }; files: string[] }): Promise<Array<{ result?: unknown }>>;
  };
  storage: { local: { get(keys?: string[]): Promise<Record<string, unknown>>; set(items: Record<string, unknown>): Promise<void>; remove(keys?: string[]): Promise<void> } };
}

declare const chrome: ChromeNamespace;
