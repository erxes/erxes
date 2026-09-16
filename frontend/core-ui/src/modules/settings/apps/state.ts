import { atom } from 'jotai';
import { IApp } from './types';

export const editingAppAtom = atom<IApp | null>(null);
export const isAddingAppAtom = atom<boolean>(false);
