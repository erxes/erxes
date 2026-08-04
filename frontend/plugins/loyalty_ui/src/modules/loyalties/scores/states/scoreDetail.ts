import { atom } from 'jotai';
import { IScoreLog } from '../types/score';

// The score log row whose per-person detail sheet is open (null when closed).
// Kept at the table level so the row "Detail" action and the single sheet
// instance share state without a component import cycle.
export const scoreDetailRecordAtom = atom<IScoreLog | null>(null);
