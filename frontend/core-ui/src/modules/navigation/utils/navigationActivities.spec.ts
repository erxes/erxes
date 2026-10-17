import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { findAppActivityByPath } from '@/navigation/utils/navigationActivities';

const frontline: INavigationActivity = {
  id: 'frontline',
  label: 'Frontline',
  kind: 'plugin',
  defaultPath: 'frontline/inbox',
  modules: [
    { name: 'inbox', path: 'frontline/inbox' },
    { name: 'calls', path: 'frontline/calls/dashboard' },
  ],
};

const contacts: INavigationActivity = {
  id: 'core:contacts',
  label: 'Contacts',
  kind: 'core',
  defaultPath: 'contacts',
  modules: [{ name: 'contacts', path: 'contacts' }],
};

const activities = [frontline, contacts];

describe('findAppActivityByPath', () => {
  it('matches a registered module path', () => {
    expect(findAppActivityByPath(activities, '/frontline/inbox')).toBe(
      frontline,
    );
    expect(findAppActivityByPath(activities, '/contacts/customers')).toBe(
      contacts,
    );
  });

  it('falls back to the app segment for nested plugin pages', () => {
    expect(findAppActivityByPath(activities, '/frontline/calls/123')).toBe(
      frontline,
    );
  });

  it('returns nothing outside any app', () => {
    expect(findAppActivityByPath(activities, '/')).toBeUndefined();
    expect(findAppActivityByPath(activities, '/my-inbox')).toBeUndefined();
  });
});
