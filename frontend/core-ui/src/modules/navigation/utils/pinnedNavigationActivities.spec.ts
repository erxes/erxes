import {
  resolvePinnedNavigationActivityIds,
  resolveVisibleNavigationActivityIds,
  updatePinnedNavigationActivityIds,
} from '@/navigation/utils/pinnedNavigationActivities';

describe('pinned navigation activities', () => {
  const availableActivityIds = [
    'sales',
    'operation',
    'core:contacts',
    'core:segments',
  ];

  it('treats all available activities as pinned before customization', () => {
    expect(
      resolvePinnedNavigationActivityIds(null, availableActivityIds),
    ).toEqual(availableActivityIds);
  });

  it('filters unavailable activities and keeps the navigation order', () => {
    expect(
      resolvePinnedNavigationActivityIds(
        ['core:segments', 'removed-plugin', 'sales'],
        availableActivityIds,
      ),
    ).toEqual(['sales', 'core:segments']);
  });

  it('materializes the current activities when the first item is unpinned', () => {
    expect(
      updatePinnedNavigationActivityIds({
        activityId: 'operation',
        availableActivityIds,
        pinned: false,
        storedActivityIds: null,
      }),
    ).toEqual(['sales', 'core:contacts', 'core:segments']);
  });

  it('pins an activity back in its original navigation position', () => {
    expect(
      updatePinnedNavigationActivityIds({
        activityId: 'operation',
        availableActivityIds,
        pinned: true,
        storedActivityIds: ['sales', 'core:contacts'],
      }),
    ).toEqual(['sales', 'operation', 'core:contacts']);
  });

  it('keeps newly available activities unpinned after customization', () => {
    expect(
      resolvePinnedNavigationActivityIds(
        ['sales', 'core:contacts'],
        availableActivityIds,
      ),
    ).toEqual(['sales', 'core:contacts']);
  });

  it('shows every activity when the pinned list is empty', () => {
    expect(
      resolveVisibleNavigationActivityIds([], availableActivityIds),
    ).toEqual(availableActivityIds);
  });

  it('shows only pinned activities when at least one is pinned', () => {
    expect(
      resolveVisibleNavigationActivityIds(
        ['operation', 'core:segments'],
        availableActivityIds,
      ),
    ).toEqual(['operation', 'core:segments']);
  });
});
