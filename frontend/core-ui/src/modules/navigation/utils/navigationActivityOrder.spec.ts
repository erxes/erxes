import {
  moveNavigationActivityId,
  sortNavigationActivitiesByOrder,
} from '@/navigation/utils/navigationActivityOrder';

describe('navigation activity order', () => {
  const activities = [{ id: 'sales' }, { id: 'contacts' }, { id: 'inbox' }];

  it('keeps the original order until one is stored', () => {
    expect(sortNavigationActivitiesByOrder(activities, null)).toEqual(
      activities,
    );
  });

  it('sorts by stored order and appends unknown activities', () => {
    expect(
      sortNavigationActivitiesByOrder(activities, ['inbox', 'sales']).map(
        ({ id }) => id,
      ),
    ).toEqual(['inbox', 'sales', 'contacts']);
  });

  it('swaps with the neighbor inside the scope', () => {
    expect(
      moveNavigationActivityId({
        activityId: 'contacts',
        allActivityIds: ['sales', 'contacts', 'inbox'],
        direction: 'up',
        scopeActivityIds: ['sales', 'contacts'],
      }),
    ).toEqual(['contacts', 'sales', 'inbox']);
  });

  it('does nothing at the edge of the scope', () => {
    const allActivityIds = ['sales', 'contacts', 'inbox'];

    expect(
      moveNavigationActivityId({
        activityId: 'sales',
        allActivityIds,
        direction: 'up',
        scopeActivityIds: ['sales', 'contacts'],
      }),
    ).toEqual(allActivityIds);
  });
});
