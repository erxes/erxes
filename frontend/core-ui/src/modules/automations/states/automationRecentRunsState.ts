import { TAutomationRecentRun } from '@/automations/types';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const automationRecentRunsState = atom<
  Record<string, TAutomationRecentRun[]>
>({});

/** One atom per row, like the run counts, so a payload re-renders only cells. */
export const automationRecentRunsAtomFamily = atomFamily((id: string) =>
  atom((get) => get(automationRecentRunsState)[id]),
);
