import { atom } from 'jotai';

export type AgentActivityPhase =
  | 'idle'
  | 'thinking'
  | 'working'
  | 'awaiting'
  | 'error';

export interface IAgentActivity {
  phase: AgentActivityPhase;
  /** Replies that finished while the side panel was closed. */
  unread: number;
  /** ms epoch when the last busy turn finished; null while busy/never. */
  finishedAt: number | null;
  /** ms epoch of the latest chat error. */
  errorAt: number | null;
  /** BYOK gate: null while the connections query is still loading. */
  hasConnection: boolean | null;
}

/**
 * Activity shown by the top-bar Assistant button, written by the side-panel
 * chat (sessionScope 'panel') through `useAgentActivity`. The panel stays
 * mounted once opened, so the stream — and therefore this atom — keeps
 * updating while it is closed.
 */
export const agentActivityState = atom<IAgentActivity>({
  phase: 'idle',
  unread: 0,
  finishedAt: null,
  errorAt: null,
  hasConnection: null,
});
