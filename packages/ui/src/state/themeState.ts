import { z } from 'zod';
import { stored } from '../lib/stored';

const THEMES = ['light', 'dark', 'system'] as const;

/** The UI theme a member picks: `light`, `dark` or `system`. */
export const ThemeOption = z.enum(THEMES);

export type ThemeOption = z.infer<typeof ThemeOption>;

/**
 * The member's theme choice as a jotai atom, kept in localStorage.
 * web applies it to the page; `useAtom(themeState)` reads and sets it.
 */
export const themeState = stored({ key: 'erxes:ui:theme', schema: ThemeOption, initial: 'system' });
