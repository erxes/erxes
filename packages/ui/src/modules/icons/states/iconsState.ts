import { atom } from 'jotai';
import type { TablerIcon } from '@tabler/icons-react';

export const iconsState = atom<Record<string, TablerIcon>>({});
