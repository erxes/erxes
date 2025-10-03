import { atom } from 'jotai';
import { TablerIcon } from '@tabler/icons-react';

export const iconsState = atom<Record<string, TablerIcon>>({});
