import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import {
  doesNavigationActivityMatchPath,
  findNavigationActivityByPath,
} from '@/navigation/utils/navigationActivities';

const activities: INavigationActivity[] = [
  {
    id: 'sales',
    label: 'Sales',
    kind: 'plugin',
    defaultPath: 'sales',
    modules: [{ name: 'Sales', path: 'sales' }],
  },
  {
    id: 'core:contacts',
    label: 'Contacts',
    kind: 'core',
    defaultPath: 'contacts',
    modules: [
      {
        name: 'Customers',
        path: 'contacts/customers',
      },
    ],
  },
];

describe('navigation activities', () => {
  it('matches nested routes to their activity', () => {
    expect(
      doesNavigationActivityMatchPath(
        activities[1],
        '/contacts/customers/65dc522c74f0f633af8b41e6',
      ),
    ).toBe(true);
  });

  it('finds the activity that owns the current route', () => {
    expect(
      findNavigationActivityByPath(activities, '/sales/pipelines'),
    ).toEqual(activities[0]);
  });
});
