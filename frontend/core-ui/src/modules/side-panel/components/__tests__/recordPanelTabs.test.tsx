/** @jest-environment jsdom */
import { IconMessage } from '@tabler/icons-react';
import { buildRecordPanelTabs } from '../recordPanelTabs';
import type { IContactPanelOverview } from '@/side-panel/hooks/useContactPanelOverview';
import type { TContactOverviewEntry } from '@/side-panel/components/relations/contactOverviewEntries';

jest.mock('erxes-ui', () => ({ ScrollArea: () => null }));
jest.mock('ui-modules', () => ({
  ContactOverviewSectionContext: jest
    .requireActual<typeof import('react')>('react')
    .createContext(null),
}));
jest.mock('@/side-panel/components/relations/ContactOverview', () => ({
  ContactOverview: () => null,
}));
jest.mock('@/side-panel/components/relations/SidePanelRelations', () => ({
  SidePanelRelations: () => null,
}));
jest.mock('@/side-panel/components/details/RecordPanelActivity', () => ({
  RecordPanelActivity: () => null,
}));
jest.mock('~/plugins/components/RenderPluginsComponent', () => ({
  RenderPluginsComponent: () => null,
}));

it.each(['core:customer', 'core:company'] as const)(
  'shows one conversation tab while retaining other pinned tabs for %s',
  (contactType) => {
    const entries: TContactOverviewEntry[] = ['conversation', 'ticket'].map(
      (name) => ({
        key: `frontline.${name}`,
        label: name,
        kind: 'widget',
        tab: {
          value: `frontline.${name}`,
          label: name,
          icon: IconMessage,
          content: <p>{name}</p>,
        },
      }),
    );
    const overview: IContactPanelOverview = {
      contactType,
      allEntries: entries,
      pinned: entries,
      overviewEntries: [],
      moreTabs: [],
      layout: { order: [], tabs: entries.map((entry) => entry.key) },
      onUnavailable: jest.fn(),
      onReorder: jest.fn(),
      onToggleTab: jest.fn(),
    };
    const tabs = buildRecordPanelTabs({
      record: { contentType: contactType, contentId: 'contact-a' },
      views: null,
      pluginName: null,
      overview,
      access: 'write',
      noteRef: { current: null },
      labels: {
        detail: 'Details',
        properties: 'Properties',
        messages: 'Messages',
        relations: 'Relations',
        activity: 'Activity',
      },
    });
    const values = tabs.map((tab) => tab.value);
    expect(values).toContain('module:frontline.ticket');
    if (contactType === 'core:customer') {
      expect(values).toContain('messages');
      expect(values).not.toContain('module:frontline.conversation');
    } else {
      expect(values).toContain('module:frontline.conversation');
      expect(values).not.toContain('messages');
    }
  },
);
