// The only proof of who this browser is to the API; ids alone prove nothing.
const STORAGE_KEY = 'erxes_widget_token';

export const WIDGET_SESSION_HEADER = 'erxes-widget-token';

// Kept in memory too, so a browser that blocks storage still has a session
// for as long as the page is open.
let memoryToken: string | null = null;

export const getWidgetToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? memoryToken;
  } catch {
    return memoryToken;
  }
};

export const setWidgetToken = (token?: string | null) => {
  memoryToken = token || null;

  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // storage blocked: the in-memory copy carries the session
  }
};
