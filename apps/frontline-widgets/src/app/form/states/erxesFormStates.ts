import { atom } from 'jotai';

export const activeStepAtom = atom<number>(1);

export const formValuesAtom = atom<Record<string, any> | null>(null);
