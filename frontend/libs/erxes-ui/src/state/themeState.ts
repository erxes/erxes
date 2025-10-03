import { atomWithStorage } from 'jotai/utils';
import { ThemeOption } from '../types';

export const themeState = atomWithStorage<ThemeOption>('erxes-theme', 'light');
