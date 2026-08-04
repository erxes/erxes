import { atom } from 'jotai';
import { IApp } from './types';

export const editingAppAtom = atom<IApp | null>(null);
