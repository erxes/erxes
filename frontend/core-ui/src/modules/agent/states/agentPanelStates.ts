import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type AgentPanelMode = 'lens' | 'companion';

/** Device-local presentation; both modes share the same routed chat instance. */
export const agentPanelModeState = atomWithStorage<AgentPanelMode>(
  'agent:panel-mode',
  'companion',
  undefined,
  { getOnInit: true },
);

/** Assistant's own width, so it can sit beside a record panel of another width. */
export const assistantPanelWidthState = atomWithStorage<number>(
  'agent:panel-width',
  440,
  undefined,
  { getOnInit: true },
);

/**
 * One-shot thread request from an old `/assistant/:threadId` link,
 * consumed by the Assistant side panel after redirecting to the workspace.
 */
export const agentSidePanelThreadRequestState = atom<string | null>(null);
