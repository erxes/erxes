import {
  getAdjacentVisitedPageTabId,
  insertVisitedPageTabAfter,
  normalizeVisitedPageTabs,
  updateVisitedPageTab,
} from '@/navigation/utils/visitedPageTabs';

describe('visited page tabs', () => {
  it('updates navigation in the active tab instead of adding another tab', () => {
    const tabs = [
      { id: 'first-tab', pathname: '/my-inbox' },
      { id: 'second-tab', pathname: '/contacts' },
    ];

    expect(
      updateVisitedPageTab(tabs, 'first-tab', '/automations', 'status=active'),
    ).toEqual([
      {
        id: 'first-tab',
        pathname: '/automations',
        search: '?status=active',
      },
      { id: 'second-tab', pathname: '/contacts' },
    ]);
  });

  it('inserts an explicit new tab immediately after the active tab', () => {
    const tabs = [
      { id: 'first-tab', pathname: '/contacts' },
      { id: 'third-tab', pathname: '/automations' },
    ];

    expect(
      insertVisitedPageTabAfter(
        tabs,
        { id: 'second-tab', pathname: '/my-inbox' },
        'first-tab',
      ),
    ).toEqual([
      { id: 'first-tab', pathname: '/contacts' },
      { id: 'second-tab', pathname: '/my-inbox' },
      { id: 'third-tab', pathname: '/automations' },
    ]);
  });

  it('keeps tabs with duplicate locations independent', () => {
    const tabs = normalizeVisitedPageTabs([
      { id: 'first-tab', pathname: '/my-inbox' },
      { id: 'second-tab', pathname: '/my-inbox' },
    ]);

    expect(tabs).toHaveLength(2);
    expect(getAdjacentVisitedPageTabId(tabs, 'first-tab', 'next')).toBe(
      'second-tab',
    );
  });

  it('assigns a stable identity to tabs stored by the previous implementation', () => {
    const storedTabs = [{ pathname: '/contacts' }];

    expect(normalizeVisitedPageTabs(storedTabs)).toEqual(
      normalizeVisitedPageTabs(storedTabs),
    );
    expect(normalizeVisitedPageTabs(storedTabs)[0].id).toBe(
      'legacy:%2Fcontacts',
    );
  });
});
