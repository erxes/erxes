import {
  INavigationMenuItemControls,
  NavigationMenuItemControlsContext,
} from 'erxes-ui';
import { type ReactNode, useMemo } from 'react';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NavigationChildActions } from '@/navigation/components/navigation-activity-rail/NavigationChildActions';
import { getNavigationChildOrder } from '@/navigation/utils/navigationChildOrder';
import { navigationChildOrderState } from '@/navigation/states/navigationChildOrderState';
import { useAtom } from 'jotai';

export const NavigationChildControlsProvider = ({
  activity,
  children,
}: Readonly<{ activity: INavigationActivity; children: ReactNode }>) => {
  const [orders, setOrders] = useAtom(navigationChildOrderState);
  const storedPaths = orders[activity.id];

  const controls = useMemo<INavigationMenuItemControls>(
    () => ({
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
    }),
    [activity, setOrders, storedPaths],
  );

  return (
    <NavigationMenuItemControlsContext.Provider value={controls}>
      {children}
    </NavigationMenuItemControlsContext.Provider>
  );
};
