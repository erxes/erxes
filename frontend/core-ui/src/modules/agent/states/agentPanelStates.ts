import { atom } from 'jotai';

/**
 * One-shot thread request from an old `/assistant/:threadId` link,
 * consumed by the Assistant side panel after redirecting to the workspace.
 */
export const agentSidePanelThreadRequestState = atom<string | null>(null);
