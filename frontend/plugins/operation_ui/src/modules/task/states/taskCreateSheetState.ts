import { TAddTask } from '@/task/types';
import { atom } from 'jotai';

export const taskCreateSheetState = atom(false);
export const taskCreateDefaultValuesState = atom<Partial<TAddTask> | undefined>(
  undefined,
);
