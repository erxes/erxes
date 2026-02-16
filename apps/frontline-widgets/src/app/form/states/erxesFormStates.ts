import { atom } from 'jotai';

export const activeStepAtom = atom<number>(1);

export const showConfirmationAtom = atom<boolean>(false);

export const formValuesAtom = atom<Record<string, any> | null>(null);

export const browserInfoAtom = atom<Record<string, any> | null>(null);
