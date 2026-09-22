import {
  resolvePinnedNavigationActivityIds,
  resolveVisibleNavigationActivityIds,
} from '@/navigation/utils/pinnedNavigationActivities';

describe('pinned navigation activities', () => {
  const availableActivityIds = ['sales', 'contacts', 'broadcasts'];

  it('starts with every activity unpinned', () => {
    expect(
      resolvePinnedNavigationActivityIds(null, availableActivityIds),
    ).toEqual([]);
  });

  it('keeps every activity visible until pins are selected', () => {
    expect(
      resolveVisibleNavigationActivityIds([], availableActivityIds),
    ).toEqual(availableActivityIds);
  });
});
