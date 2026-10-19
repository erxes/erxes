import {
  INavigationMenuItemControls,
  NavigationMenuItemControlsContext,
} from 'erxes-ui';
import { type ReactNode, useMemo } from 'react';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NavigationChildActions } from '@/navigation/components/app-sidebar/NavigationChildActions';
import { getNavigationChildOrder } from '@/navigation/utils/navigationChildOrder';
import { navigationChildOrderState } from '@/navigation/states/navigationChildOrderState';
import { useAtom } from 'jotai';

export const NavigationChildControlsProvider = ({
  activity,
  children,
}: Readonly<{ activity?: INavigationActivity; children: ReactNode }>) => {
  const [orders, setOrders] = useAtom(navigationChildOrderState);
  const storedPaths = activity ? orders[activity.id] : undefined;

  // Always render the provider (null value without an activity) so callers
  // keep one element shape and never remount their children.
  const controls = useMemo<INavigationMenuItemControls | null>(
    () =>
      activity
        ? {
            getOrder: (path) => getNavigationChildOrder(storedPaths, path),
            renderActions: (item) => (
              <NavigationChildActions
                activity={activity}
                item={item}
                onReorder={(paths) =>
                  setOrders((current) => ({ ...current, [activity.id]: paths }))
                }
              />
            ),
          }
        : null,
    [activity, setOrders, storedPaths],
  );

  return (
    <NavigationMenuItemControlsContext.Provider value={controls}>
      {children}
    </NavigationMenuItemControlsContext.Provider>
  );
};
