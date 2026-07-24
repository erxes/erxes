import {
  addVisitedPageTab,
  getVisitedPageTabCloseDestination,
  getVisitedPageTabLabel,
  getVisitedPageTabTitle,
  moveVisitedPageTab,
  normalizeVisitedPageTabs,
  normalizeVisitedPagePathname,
  removeVisitedPageTab,
  visitVisitedPageTab,
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

  it('repairs malformed and duplicate persisted tabs', () => {
    expect(
      normalizeVisitedPageTabs([
        null,
        {},
        { pathname: '/' },
        { pathname: '/contacts/' },
        { pathname: '/contacts' },
        { pathname: '/segments' },
      ]),
    ).toEqual([{ pathname: '/contacts' }, { pathname: '/segments' }]);
  });

  it('tracks every distinct plugin and nested page in visit order', () => {
    const pluginPage = visitVisitedPageTab([], '/operation/tasks');
    const nestedPage = visitVisitedPageTab(
      pluginPage,
      '/operation/projects/project-1/overview',
    );
    const revisitedPluginPage = visitVisitedPageTab(
      nestedPage,
      '/operation/tasks/',
    );

    expect(revisitedPluginPage).toEqual([
      { pathname: '/operation/tasks' },
      { pathname: '/operation/projects/project-1/overview' },
    ]);
  });

  it('replaces a temporary redirect route with its destination', () => {
    expect(
      visitVisitedPageTab(
        [
          { pathname: '/my-inbox' },
          { pathname: '/operation' },
          { pathname: '/segments' },
        ],
        '/operation/tasks',
        '/operation',
      ),
    ).toEqual([
      { pathname: '/my-inbox' },
      { pathname: '/operation/tasks' },
      { pathname: '/segments' },
    ]);
  });

  it('removes a temporary redirect route when the destination is restored', () => {
    expect(
      visitVisitedPageTab(
        [
          { pathname: '/operation/tasks' },
          { pathname: '/operation' },
          { pathname: '/segments' },
        ],
        '/operation/tasks',
        '/operation',
      ),
    ).toEqual([
      { pathname: '/operation/tasks' },
      { pathname: '/segments' },
    ]);
  });

  it('uses only the last page for a nested route label', () => {
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

    expect(label).toBe('Details');
  });

  it('formats plugin tabs as plugin name and current page', () => {
    expect(getVisitedPageTabTitle('Deals', 'Sales')).toBe('Sales | Deals');
    expect(getVisitedPageTabTitle('My Inbox')).toBe('My Inbox');
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

  it('reorders tabs by their visited route', () => {
    const tabs = [
      { pathname: '/my-inbox' },
      { pathname: '/contacts' },
      { pathname: '/segments' },
    ];

    expect(moveVisitedPageTab(tabs, '/segments', '/my-inbox')).toEqual([
      { pathname: '/segments' },
      { pathname: '/my-inbox' },
      { pathname: '/contacts' },
    ]);
  });
});
