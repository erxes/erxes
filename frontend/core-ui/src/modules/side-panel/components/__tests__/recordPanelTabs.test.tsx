import { createRef } from 'react';
import { buildRecordPanelTabs } from '../recordPanelTabs';
import type { IContactPanelOverview } from '../../hooks/useContactPanelOverview';

jest.mock('erxes-ui', () => ({ ScrollArea: 'div' }));
jest.mock('ui-modules', () => ({
  ContactOverviewSectionContext: require('react').createContext(null),
}));
jest.mock('@/side-panel/components/relations/ContactOverview', () => ({
  ContactOverview: 'div',
}));
jest.mock('@/side-panel/components/relations/SidePanelRelations', () => ({
  SidePanelRelations: 'div',
}));
jest.mock('@/side-panel/components/details/RecordPanelActivity', () => ({
  RecordPanelActivity: 'div',
}));
jest.mock('~/plugins/components/RenderPluginsComponent', () => ({
  RenderPluginsComponent: 'div',
}));

const conversation = {
  kind: 'section' as const,
  key: 'frontline.conversation',
  label: 'conversations',
  module: {
    pluginName: 'frontline',
    name: 'conversation',
    label: 'conversations',
  },
};

const getTabs = (
  pinned: boolean,
  expanded = false,
  contactType: 'core:customer' | 'core:company' = 'core:customer',
) => {
  const overview: IContactPanelOverview = {
    contactType,
    allEntries: [conversation],
    pinned: pinned ? [conversation] : [],
    overviewEntries: pinned ? [] : [conversation],
    moreTabs: [],
    layout: { order: [], tabs: pinned ? [conversation.key] : [] },
    onUnavailable: jest.fn(),
    onReorder: jest.fn(),
    onToggleTab: jest.fn(),
  };
  return buildRecordPanelTabs({
    record: { contentType: contactType, contentId: 'contact-1' },
    views: {
      detail: 'Contact fields',
      properties: 'Custom properties',
      description: 'Description editor',
    },
    expanded,
    pluginName: null,
    overview,
    access: 'write',
    noteRef: createRef(),
    labels: {
      detail: 'Detail',
      properties: 'Properties',
      description: 'Description',
      messages: 'Conversations',
      relations: 'Relations',
      activity: 'Activity',
    },
  });
};

describe('contact panel tabs', () => {
  it.each([
    { contentType: 'core:customer' as const, expanded: false, visible: false },
    { contentType: 'core:customer' as const, expanded: true, visible: true },
    { contentType: 'core:company' as const, expanded: false, visible: false },
    { contentType: 'core:company' as const, expanded: true, visible: true },
  ])(
    'description tab visibility is $visible for $contentType with expanded=$expanded',
    ({ contentType, expanded, visible }) => {
      const description = getTabs(false, expanded, contentType).find(
        (tab) => tab.value === 'description',
      );
      if (visible) {
        expect(description?.label).toBe('Description');
        expect(description?.content).toBe('Description editor');
      } else {
        expect(description).toBeUndefined();
      }
    },
  );

  it('keeps conversations in Relations until the user pins them', () => {
    expect(getTabs(false).map(({ value }) => value)).toEqual([
      'detail',
      'properties',
      'relations',
      'activity',
    ]);
  });

  it('opens one Conversations tab after pinning and keeps its existing URL identifier', () => {
    const tabs = getTabs(true);
    expect(tabs.filter(({ value }) => value === 'messages')).toHaveLength(1);
    expect(tabs.find(({ value }) => value === 'messages')?.label).toBe(
      'Conversations',
    );
    expect(
      tabs.some(({ value }) => value === 'module:frontline.conversation'),
    ).toBe(false);
  });
});
