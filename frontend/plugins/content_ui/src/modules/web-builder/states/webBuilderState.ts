import { atom } from 'jotai';
import { IWeb } from '../types';

export const webDrawerState = atom<{ open: boolean; editingWeb: IWeb | null }>({
  open: false,
  editingWeb: null,
});

export const webViewModeState = atom<'thumbnail' | 'list'>('thumbnail');
