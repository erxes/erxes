import { atom } from 'jotai';

import type { IAgentsNavigationEntry } from '../utils/navigationCatalog';

/**
 * The live navigation catalog the chat attaches to every turn, shared
 * with every reference chip in its messages — `page` chips consult it to
 * decide whether a token decodes to a page this client can open.
 */
export const agentNavigationCatalogState = atom<IAgentsNavigationEntry[]>(
  [],
);
