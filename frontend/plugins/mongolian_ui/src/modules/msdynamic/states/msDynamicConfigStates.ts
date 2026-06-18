import { atom } from 'jotai';

import { MSMDynamicConfigRow } from '../types';

export const msDynamicConfigDetailAtom = atom<MSMDynamicConfigRow | null>(null);
