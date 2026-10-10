import {
  TNavigationActivityMoveDirection,
  moveNavigationActivityId,
  sortNavigationActivitiesByOrder,
} from '@/navigation/utils/navigationActivityOrder';
import { useCallback, useMemo } from 'react';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { navigationActivityOrderState } from '@/navigation/states/navigationActivityOrderState';
import { useAtom } from 'jotai';

export const useNavigationActivityOrder = (
  activities: INavigationActivity[],
) => {
  const [storedOrder, setStoredOrder] = useAtom(navigationActivityOrderState);
  const orderedActivities = useMemo(
    () => sortNavigationActivitiesByOrder(activities, storedOrder),
    [activities, storedOrder],
  );

  const moveActivity = useCallback(
    (
      activityId: string,
      direction: TNavigationActivityMoveDirection,
      scopeActivityIds: string[],
    ) =>
      setStoredOrder(
        moveNavigationActivityId({
          activityId,
          allActivityIds: orderedActivities.map((activity) => activity.id),
          direction,
          scopeActivityIds,
        }),
      ),
    [orderedActivities, setStoredOrder],
  );

  return { orderedActivities, moveActivity };
};
