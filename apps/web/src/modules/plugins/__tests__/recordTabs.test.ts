import type { TRecordTab } from 'erxes-ui';
import { describe, expect, it } from 'vite-plus/test';
import { tabsShown } from '../recordTabs';

const Icon = () => null;
const Slot = () => null;

const tab = (value: string, more: Partial<TRecordTab> = {}): TRecordTab => ({
  value,
  label: value,
  icon: Icon,
  component: Slot,
  ...more,
});

const TABS = [tab('description', { expandedOnly: true }), tab('orders')];

const values = (tabs: TRecordTab[]) => tabs.map((entry) => entry.value);

describe('a plugin record type’s own tabs', () => {
  it('leaves an expanded-only tab out of the side panel', () => {
    expect(values(tabsShown(TABS, false))).toEqual(['orders']);
  });

  it('shows every tab on the record’s own page', () => {
    expect(values(tabsShown(TABS, true))).toEqual(['description', 'orders']);
  });

  it('has none when the type gives none', () => {
    expect(tabsShown(undefined, true)).toEqual([]);
  });
});
