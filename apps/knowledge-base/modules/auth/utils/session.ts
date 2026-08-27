export type SessionUser = {
  name: string;
  email: string;
  cpUserId?: string;
};

export const SESSION_STORAGE_KEY = 'kb.session';

export const TOKEN_STORAGE_KEY = 'kb.token';

export const SESSION_EVENT = 'kb:session-change';

export const readRawSession = (): string | null => {
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const writeSession = (user: SessionUser | null) => {
  try {
    if (user) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } finally {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
};

export const parseSession = (raw: string | null): SessionUser | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as SessionUser).name === 'string' &&
      typeof (parsed as SessionUser).email === 'string'
    ) {
      const { name, email, cpUserId } = parsed as SessionUser;
      return { name, email, ...(cpUserId ? { cpUserId } : {}) };
    }
  } catch {
    return null;
  }

  return null;
};

export const readToken = (): string => {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};

export const writeToken = (token: string | null) => {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {}
};
