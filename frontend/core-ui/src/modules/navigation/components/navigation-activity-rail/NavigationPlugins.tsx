import { usePluginsNavigationGroups } from '@/navigation/hooks/usePluginsNavigationGroups';
import { navigationActivityItemCountsState } from '@/navigation/states/navigationPanelState';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { countNavigationMenuItems } from '@/navigation/utils/navigationPlacement';
import { Sidebar } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useLayoutEffect, useRef } from 'react';

export const NavigationPluginPanelContent = ({
  activityId,
}: {
  activityId: string;
}) => {
  const navigationGroups = usePluginsNavigationGroups();
  const navigationGroup = navigationGroups[activityId];
  const setItemCounts = useSetAtom(navigationActivityItemCountsState);
  const groupRef = useRef<HTMLDivElement>(null);
  const hasContents = Boolean(navigationGroup?.contents.length);

  useLayoutEffect(() => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const record = () => {
      const count = countNavigationMenuItems(group);

      if (!count) {
        return;
      }

      setItemCounts((counts) =>
        counts[activityId] === count
          ? counts
          : { ...counts, [activityId]: count },
      );
    };

    record();

    const observer = new MutationObserver(record);

    observer.observe(group, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [activityId, hasContents, setItemCounts]);

  if (!navigationGroup || !hasContents) {
    return null;
  }

  return (
    <Sidebar.Group ref={groupRef} className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {navigationGroup.contents.map((Content) => (
            <Content key={Content.displayName || Content.name} />
          ))}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};

export const NavigationPluginContextContent = ({
  activityId,
}: {
  activityId: string;
}) => {
  const navigationGroups = usePluginsNavigationGroups();
  const subGroups = navigationGroups[activityId]?.subGroups || [];

  return (
    <>
      {subGroups.map((SubGroup) => (
        <SubGroup key={SubGroup.displayName || SubGroup.name} />
      ))}
    </>
  );
};

export const NavigationItemCountProbe = ({
  activities,
}: {
  activities: INavigationActivity[];
}) => {
  const navigationGroups = usePluginsNavigationGroups();
  const itemCounts = useAtomValue(navigationActivityItemCountsState);
  const { isMobile } = Sidebar.useSidebar();
  const activityIds = isMobile
    ? []
    : activities
        .filter((activity) => {
          const navigationGroup = navigationGroups[activity.id];

          return (
            activity.kind === 'plugin' &&
            navigationGroup?.contents.length &&
            !navigationGroup.subGroups.length &&
            !itemCounts[activity.id]
          );
        })
        .map((activity) => activity.id);

  if (!activityIds.length) {
    return null;
  }

  return (
    <div aria-hidden hidden>
      {activityIds.map((activityId) => (
        <NavigationPluginPanelContent
          key={activityId}
          activityId={activityId}
        />
      ))}
    </div>
  );
};
