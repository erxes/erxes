import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import {
  buildNavigationSearchItems,
  filterNavigationSearchItems,
} from '@/search/utils/navigationSearch';

const activities: INavigationActivity[] = [
  {
    id: 'operation',
    label: 'Projects',
    kind: 'plugin',
    defaultPath: 'operation',
    modules: [
      { name: 'Overview', path: 'operation' },
      {
        name: 'Management',
        path: 'operation/projects',
        submenus: [
          { name: 'Active Projects', path: 'operation/projects/active' },
          { name: 'Archived Projects', path: 'operation/projects/archived' },
        ],
      },
    ],
  },
  {
    id: 'core:contacts',
    label: 'Contacts',
    kind: 'core',
    defaultPath: 'contacts',
    modules: [{ name: 'Contacts', path: 'contacts' }],
  },
];

describe('navigation search items', () => {
  it('builds leaf destinations and keeps plugin activities separate', () => {
    const { goToItems, pluginItems } = buildNavigationSearchItems(activities);

    expect(goToItems.map((item) => item.title)).toEqual([
      'Active Projects',
      'Archived Projects',
      'Contacts',
    ]);
    expect(goToItems[0].description).toBe('Projects › Management');
    expect(pluginItems.map((item) => item.title)).toEqual(['Projects']);
  });

  it('matches labels, breadcrumbs, and paths case-insensitively', () => {
    const { goToItems } = buildNavigationSearchItems(activities);

    expect(
      filterNavigationSearchItems(goToItems, 'MANAGEMENT').map(
        (item) => item.title,
      ),
    ).toEqual(['Active Projects', 'Archived Projects']);
    expect(filterNavigationSearchItems(goToItems, 'contacts')).toHaveLength(1);
  });
});
