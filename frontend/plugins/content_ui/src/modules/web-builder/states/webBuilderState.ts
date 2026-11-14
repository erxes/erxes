import { atom } from 'jotai';

export const webViewModeState = atom<'thumbnail' | 'list'>('thumbnail');
