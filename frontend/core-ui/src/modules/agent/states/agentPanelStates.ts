import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  defaultTrayPosition,
  parseTrayPosition,
  type ITrayPosition,
} from '../utils/trayPosition';

/**
 * Docked AI chat side panel: open flag and last width persist across
 * sessions. The panel renders inside `NavigationWorkspace` so the page
 * stays usable while chatting.
 */
export const agentSidePanelOpenState = atomWithStorage<boolean>(
  'agent:side-panel-open',
  false,
  undefined,
  { getOnInit: true },
);

export const agentSidePanelWidthState = atomWithStorage<number>(
  'agent:side-panel-width',
  420,
  undefined,
  { getOnInit: true },
);

export const AGENT_SIDE_PANEL_MIN_WIDTH = 360;
export const AGENT_SIDE_PANEL_MAX_WIDTH = 720;

/**
 * One-shot "open this thread in the side panel" request: set by a
 * reference-chip click on the full `/agent` page, consumed by the panel.
 */
export const agentSidePanelThreadRequestState = atom<string | null>(null);

/**
 * Chat transcript width preset on the full `/agent` page — 'standard' |
 * 'wide' | 'full'. Persisted; the side panel always uses 'full' internally.
 */
export const agentChatWidthState = atomWithStorage<'standard' | 'wide' | 'full'>(
  'agent:chat-width',
  'wide',
  undefined,
  { getOnInit: true },
);

/** Docked edge + height ratio of the floating agent tray. Raw storage
 * goes through `parseTrayPosition`: stale keys from older builds (or
 * hand-edited JSON) would otherwise surface as NaN offsets. */
const agentTrayPositionStorage = atomWithStorage<unknown>(
  'agent:tray-position',
  typeof window === 'undefined'
    ? { side: 'right', yRatio: 1 }
    : defaultTrayPosition(window.innerHeight),
  undefined,
  { getOnInit: true },
);

export const agentTrayPositionState = atom(
  (get) =>
    parseTrayPosition(
      get(agentTrayPositionStorage),
      typeof window === 'undefined' ? 900 : window.innerHeight,
    ),
  (_get, set, position: ITrayPosition) => {
    set(agentTrayPositionStorage, position);
  },
);

/** Whether the `/agent` thread sidebar is open on large screens. */
export const agentThreadsSidebarOpenState = atomWithStorage<boolean>(
  'agent:threads-sidebar-open',
  true,
  undefined,
  { getOnInit: true },
);
