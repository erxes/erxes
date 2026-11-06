import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type AgentPanelMode = 'lens' | 'companion';

/** Device-local presentation; both modes share the same routed chat instance. */
export const agentPanelModeState = atomWithStorage<AgentPanelMode>(
  'agent:panel-mode',
  'lens',
  undefined,
  { getOnInit: true },
);

/**
 * One-shot thread request from an old `/assistant/:threadId` link,
 * consumed by the Assistant side panel after redirecting to the workspace.
 */
export const agentSidePanelThreadRequestState = atom<string | null>(null);
