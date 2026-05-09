import { atom } from 'jotai';
import { BlockInstance } from '../../blocks/types';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const blocksAtom = atom<BlockInstance[]>([]);
export const selectedBlockIdAtom = atom<string | null>(null);
export const dirtyAtom = atom<boolean>(false);
export const deviceAtom = atom<DeviceMode>('desktop');
