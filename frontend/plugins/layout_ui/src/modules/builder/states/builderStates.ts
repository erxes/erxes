import { atom } from 'jotai';
import { BuilderNode, DeviceMode, DragSource, LayoutPage } from '../types';
import { readPages } from '../utils/storage';

export const pagesAtom = atom<LayoutPage[]>(readPages());

export const pageDraftAtom = atom<LayoutPage | null>(null);

export const selectedNodeIdAtom = atom<string | null>(null);

export const deviceAtom = atom<DeviceMode>('desktop');

export const dirtyAtom = atom<boolean>(false);

export const dragSourceAtom = atom<DragSource | null>(null);

export const paletteDragTypeAtom = atom<string | null>(null);

export type HistoryState = {
  past: BuilderNode[];
  future: BuilderNode[];
};

export const historyAtom = atom<HistoryState>({ past: [], future: [] });
