import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const sidebarPanelOpenState = atomWithStorage<boolean>(
  'sidebar:panel-open',
  true,
  undefined,
  { getOnInit: true },
);

/** On a phone, the path the panel was opened on: it covers the page, so it closes when you leave. */
export const sidebarPanelOpenedAtState = atom<string | null>(null);
