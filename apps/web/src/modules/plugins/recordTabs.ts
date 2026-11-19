import type { TRecordTab } from 'erxes-ui';

/** A record type's own tabs for this view: the side panel leaves out the expanded-only ones. */
export const tabsShown = (tabs: TRecordTab[] | undefined, expanded: boolean): TRecordTab[] =>
  (tabs ?? []).filter((tab) => expanded || !tab.expandedOnly);
