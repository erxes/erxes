import { atom } from 'jotai';
import { z } from 'zod';
import { stored } from '../lib/stored';

export const sidebarPanelOpenState = stored({
  key: 'erxes:ui:sidebar-open',
  schema: z.boolean(),
  initial: true,
});

/** On a phone, the path the panel was opened on: it covers the page, so it closes when you leave. */
export const sidebarPanelOpenedAtState = atom<string | null>(null);
