import { atom } from 'jotai';

/**
 * One-shot thread request from an old `/agent/:threadId` bookmark,
 * consumed by the Assistant side panel after redirecting to the workspace.
 */
export const agentSidePanelThreadRequestState = atom<string | null>(null);
