import { atom } from 'jotai';

// What each node's own content reported as still missing, by node id. Kept
// when a node unmounts (switching tabs) and read only for nodes still in the
// form, so a removed node leaves nothing behind.
export const reportedNodeIssuesAtom = atom<Record<string, string[]>>({});
