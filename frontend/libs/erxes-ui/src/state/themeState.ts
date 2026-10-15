import { ThemeOption } from '../types';
import { atomWithStorage } from 'jotai/utils';

export const themeState = atomWithStorage<ThemeOption>('erxes-theme', 'system');
