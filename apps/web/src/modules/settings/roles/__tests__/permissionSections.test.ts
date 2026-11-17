import type { PermissionInfo } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { filterSections, sectionsOf } from '../permissionSections';

const permission = (action: string, group: string, source = 'core'): PermissionInfo => ({
  action,
  group,
  label: action.replace('.', ' '),
  description: null,
  source,
  ownerOnly: false,
});

const catalog = [
  permission('tickets.view', 'Tickets', 'frontline'),
  permission('contacts.view', 'Contacts'),
  permission('deals.view', 'Deals', 'sales'),
  permission('contacts.manage', 'Contacts'),
  permission('team.view', 'Team'),
];

const titles: Record<string, string> = { frontline: 'Frontline', sales: 'Accounts', core: 'Core' };

const sets = [
  {
    source: 'frontline',
    key: 'agent',
    label: 'Agent',
    description: null,
    permissions: ['tickets.view'],
  },
];

const sections = sectionsOf(catalog, sets, (source) => titles[source] ?? source);

describe('sectionsOf', () => {
  it('puts core first, then the plugins by title, each by area', () => {
    expect(sections.map((section) => section.title)).toEqual(['Core', 'Accounts', 'Frontline']);
    expect(sections[0]?.groups.map((group) => group.name)).toEqual(['Contacts', 'Team']);
    expect(sections[0]?.actions).toEqual(['contacts.view', 'contacts.manage', 'team.view']);
    expect(sections[2]?.sets.map((set) => set.key)).toEqual(['agent']);
  });
});

describe('filterSections', () => {
  const none = new Set<string>();

  it('keeps every word a permission matches and drops empty areas and sections', () => {
    const shown = filterSections(sections, 'contacts man', 'all', none);

    expect(shown.map((section) => section.source)).toEqual(['core']);
    expect(shown[0]?.groups).toEqual([{ name: 'Contacts', permissions: [catalog[3]] }]);
    expect(shown[0]?.actions).toHaveLength(3);
  });

  it('keeps all of a section its title matches, with its sets', () => {
    const shown = filterSections(sections, 'front', 'all', none);

    expect(shown.map((section) => section.source)).toEqual(['frontline']);
    expect(shown[0]?.sets).toHaveLength(1);
  });

  it('shows only granted or only missing permissions, without sets', () => {
    const granted = new Set(['contacts.view', 'tickets.view']);

    const actionsOf = (filter: 'granted' | 'not-granted') =>
      filterSections(sections, '', filter, granted).flatMap((section) =>
        section.groups.flatMap((group) => group.permissions.map((item) => item.action)),
      );

    expect(actionsOf('granted')).toEqual(['contacts.view', 'tickets.view']);
    expect(actionsOf('not-granted')).toEqual(['contacts.manage', 'team.view', 'deals.view']);
    expect(filterSections(sections, '', 'granted', granted).every((s) => !s.sets.length)).toBe(
      true,
    );
  });
});
