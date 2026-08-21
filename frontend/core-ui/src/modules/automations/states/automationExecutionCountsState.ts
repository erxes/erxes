import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const automationExecutionCountsState = atom<Record<string, number>>({});

/**
 * One atom per row so a resolved counts payload only re-renders the cells whose
 * number actually changed — the table and every other cell stay untouched.
 */
export const automationExecutionCountAtomFamily = atomFamily((id: string) =>
  atom((get) => get(automationExecutionCountsState)[id]),
);

export const automationExecutionCountsLoadingState = atom<boolean>(false);
