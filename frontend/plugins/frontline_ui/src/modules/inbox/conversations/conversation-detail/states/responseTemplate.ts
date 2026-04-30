import { atom } from 'jotai';
import type { TViewMode } from '../types';

export const responseListViewAtom = atom<TViewMode>('list');
