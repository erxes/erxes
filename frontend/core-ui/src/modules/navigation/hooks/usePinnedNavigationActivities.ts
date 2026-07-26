import { pinnedNavigationActivityIdsState } from '@/navigation/states/pinnedNavigationActivitiesState';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import {
  resolvePinnedNavigationActivityIds,
  resolveVisibleNavigationActivityIds,
  updatePinnedNavigationActivityIds,
} from '@/navigation/utils/pinnedNavigationActivities';
import { useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const usePinnedNavigationActivities = (
  activities: INavigationActivity[],
) => {
  const [storedActivityIds, setStoredActivityIds] = useAtom(
    pinnedNavigationActivityIdsState,
  );
  const availableActivityIds = useMemo(
    () => activities.map((activity) => activity.id),
    [activities],
  );
  const pinnedActivityIds = useMemo(
    () =>
      resolvePinnedNavigationActivityIds(
        storedActivityIds,
        availableActivityIds,
      ),
    [availableActivityIds, storedActivityIds],
  );
  const pinnedActivityIdSet = useMemo(
    () => new Set(pinnedActivityIds),
    [pinnedActivityIds],
  );
  const visibleActivityIdSet = useMemo(
    () =>
      new Set(
        resolveVisibleNavigationActivityIds(
          pinnedActivityIds,
          availableActivityIds,
        ),
      ),
    [availableActivityIds, pinnedActivityIds],
  );
  const visibleActivities = activities.filter((activity) =>
    visibleActivityIdSet.has(activity.id),
  );

  const setActivityPinned = useCallback(
    (activityId: string, pinned: boolean) => {
      setStoredActivityIds((currentActivityIds) =>
        updatePinnedNavigationActivityIds({
          activityId,
          availableActivityIds,
          pinned,
          storedActivityIds: currentActivityIds,
        }),
      );
    },
    [availableActivityIds, setStoredActivityIds],
  );

  const isActivityPinned = useCallback(
    (activityId: string) => pinnedActivityIdSet.has(activityId),
    [pinnedActivityIdSet],
  );

  return {
    isActivityPinned,
    setActivityPinned,
    visibleActivities,
  };
};
