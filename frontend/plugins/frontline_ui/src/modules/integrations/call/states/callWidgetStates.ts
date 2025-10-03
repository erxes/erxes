import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const callWidgetPositionState = atomWithStorage<{
  x: number;
  y: number;
}>('callWidgetPosition', {
  x: 0,
  y: 0,
});

export const showNumbersState = atom<boolean>(false);

export const expandWidgetState = atom<boolean>(false);

export const callNumberState = atom<string>('');
