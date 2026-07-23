import {
  addVisitedPageTab,
  getVisitedPageTabCloseDestination,
  getVisitedPageTabLabel,
  normalizeVisitedPagePathname,
  removeVisitedPageTab,
} from '@/navigation/utils/visitedPageTabs';

const labels = {
  details: 'Details',
  myInbox: 'My Inbox',
};

describe('visited page tabs', () => {
  it('normalizes paths and does not duplicate a visited route', () => {
    const firstVisit = addVisitedPageTab([], '/contacts/');
    const secondVisit = addVisitedPageTab(firstVisit, '/contacts');

    expect(normalizeVisitedPagePathname('/contacts/')).toBe('/contacts');
    expect(secondVisit).toEqual([{ pathname: '/contacts' }]);
  });

  it('uses the most specific navigation item for a route label', () => {
    const label = getVisitedPageTabLabel(
      '/contacts/customers/65dc522c74f0f633af8b41e6',
      [
        {
          name: 'Contacts',
          path: 'contacts',
          submenus: [
            {
              name: 'Customers',
              path: 'contacts/customers',
            },
          ],
        },
      ],
      labels,
    );

    expect(label).toBe('Customers · Details');
  });

  it('returns the previous tab when the active tab is closed', () => {
    const tabs = [
      { pathname: '/my-inbox' },
      { pathname: '/contacts' },
      { pathname: '/contacts/customers' },
    ];

    expect(getVisitedPageTabCloseDestination(tabs, '/contacts')).toBe(
      '/my-inbox',
    );
    expect(removeVisitedPageTab(tabs, '/contacts')).toEqual([
      { pathname: '/my-inbox' },
      { pathname: '/contacts/customers' },
    ]);
  });
});
