const LAST_KIND_KEY = 'automations:aiAgentLastKind';

/**
 * Remember the last selected AI agent kind so returning to the agents list
 * (e.g. after creating or editing an agent) restores the selection instead of
 * falling back to the first kind.
 */
export const setLastSelectedAiAgentKind = (kind: string | null) => {
  if (kind) {
    sessionStorage.setItem(LAST_KIND_KEY, kind);
  } else {
    sessionStorage.removeItem(LAST_KIND_KEY);
  }
};

export const getLastSelectedAiAgentKind = (): string | null => {
  return sessionStorage.getItem(LAST_KIND_KEY);
};
