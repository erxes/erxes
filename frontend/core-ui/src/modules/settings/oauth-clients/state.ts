import { atom } from 'jotai';
import { IOAuthClientApp } from './types';

export const editingOAuthClientAtom = atom<IOAuthClientApp | null>(null);
