import { z } from 'zod';
import { stored } from '../lib/stored';

const THEMES = ['light', 'dark', 'system'] as const;

export const ThemeOption = z.enum(THEMES);

export type ThemeOption = z.infer<typeof ThemeOption>;

export const themeState = stored({ key: 'erxes:ui:theme', schema: ThemeOption, initial: 'system' });
