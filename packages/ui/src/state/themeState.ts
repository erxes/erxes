import type { ThemeOption } from '../types/Theme';
import { atomWithStorage } from 'jotai/utils';

export const themeState = atomWithStorage<ThemeOption>('erxes-theme', 'system');
