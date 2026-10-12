import {
  TNavigationActivityMoveDirection,
  moveNavigationActivityId,
} from '@/navigation/utils/navigationActivityOrder';
import { createFavoriteBreadcrumb } from 'ui-modules';
import { useRef, useState } from 'react';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { INavigationMenuItemInfo } from 'erxes-ui';
import { NavigationActivityActions } from '@/navigation/components/navigation-activity-rail/NavigationActivityActions';
import { useNavigationFavorite } from '@/navigation/hooks/useNavigationFavorite';
import { getVisualNavigationChildPaths } from '@/navigation/utils/navigationChildOrder';

export const NavigationChildActions = ({
  activity,
  item,
  onReorder,
}: Readonly<{
  activity: INavigationActivity;
  item: INavigationMenuItemInfo;
  onReorder: (paths: string[]) => void;
}>) => {
  const { isFavorite, toggleFavorite } = useNavigationFavorite({
    path: item.path,
    breadcrumb: createFavoriteBreadcrumb(activity.label, item.name),
  });
  const rowRef = useRef<Element | null>(null);
  const [bounds, setBounds] = useState({ down: false, up: false });

  const handleMenuOpenChange = (open: boolean, element: HTMLElement | null) => {
    if (!open) {
      return;
    }

    rowRef.current = element?.closest('[data-nav-path]') ?? null;

    const paths = getVisualNavigationChildPaths(rowRef.current);
    const index = paths.indexOf(item.path);

    setBounds({ down: index >= 0 && index < paths.length - 1, up: index > 0 });
  };

  const handleMove = (direction: TNavigationActivityMoveDirection) => {
    const paths = getVisualNavigationChildPaths(rowRef.current);

    onReorder(
      moveNavigationActivityId({
        activityId: item.path,
        allActivityIds: paths,
        direction,
        scopeActivityIds: paths,
      }),
    );
  };

  return (
    <NavigationActivityActions
      canMoveDown={bounds.down}
      canMoveUp={bounds.up}
      className="right-1"
      favorite={isFavorite}
      path={item.path}
      revealGroup="menu-item"
      onFavoriteChange={toggleFavorite}
      onMenuOpenChange={handleMenuOpenChange}
      onMove={handleMove}
    />
  );
};
