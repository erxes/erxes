import { atom } from 'jotai';

export const addingStatusState = atom<number | null>(null);
export const editingStatusState = atom<string | null>(null);

