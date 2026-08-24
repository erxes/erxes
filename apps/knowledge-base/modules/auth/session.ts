export type SessionUser = {
  name: string;
  email: string;
  /**
   * erxes client portal user id. Present once the portal is signed in against
   * the client portal API; the ticket history is scoped to it.
   */
  cpUserId?: string;
};

export const SESSION_STORAGE_KEY = 'kb.session';

/** Dispatched after a same-tab write so subscribers re-read the store. */
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
