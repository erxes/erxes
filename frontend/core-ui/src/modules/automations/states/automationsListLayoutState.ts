import { atomWithStorage } from 'jotai/utils';

export type TAutomationsListLayout = 'list' | 'grid';

/**
 * Layout survives leaving the list, because entry points back into
 * `/automations` (the builder breadcrumb, the sidebar) carry no query string.
 */
export const automationsListLayoutState =
  atomWithStorage<TAutomationsListLayout>(
    'automations:list-layout',
    'list',
    undefined,
    { getOnInit: true },
  );
