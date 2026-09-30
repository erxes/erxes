import { NavigationActivityRail } from '@/navigation/components/NavigationActivityRail';
import { NavigationItemCountProbe } from '@/navigation/components/NavigationPlugins';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePinnedNavigationActivities } from '@/navigation/hooks/usePinnedNavigationActivities';
import { expandedNavigationActivityState } from '@/navigation/states/navigationPanelState';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import { globalSearchOpenState } from '@/search/states/globalSearchState';
import { AppPath } from '@/types/paths/AppPath';
import { activePluginState } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const MainNavigationBar = () => {
  const activities = useNavigationActivities();
  const { isActivityPinned, setActivityPinned, visibleActivities } =
    usePinnedNavigationActivities(activities);
  const [activeActivityId, setActiveActivityId] = useAtom(activePluginState);
  const [expandedActivityId, setExpandedActivityId] = useAtom(
    expandedNavigationActivityState,
  );
  const setSearchOpen = useSetAtom(globalSearchOpenState);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isSettings = pathname.includes(`/${AppPath.Settings}`);
  const isInboxActive =
    pathname === `/${AppPath.MyInbox}` ||
    pathname.startsWith(`/${AppPath.MyInbox}/`);
  const routeActivity = findNavigationActivityByPath(activities, pathname);
  const activeActivity =
    routeActivity ||
    activities.find((activity) => activity.id === activeActivityId) ||
    activities[0];
  const routeActivityId = routeActivity?.id;
  const isListed = (activity: INavigationActivity) =>
    activity.id === routeActivityId || visibleActivities.includes(activity);
  const listedActivities = activities.filter(isListed);
  const unlistedActivities = activities.filter(
    (activity) => !isListed(activity),
  );
  const unfoldedRouteActivityId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      !routeActivityId ||
      unfoldedRouteActivityId.current === routeActivityId
    ) {
      return;
    }

    unfoldedRouteActivityId.current = routeActivityId;
    setExpandedActivityId(routeActivityId);
  }, [routeActivityId, setExpandedActivityId]);

  useEffect(() => {
    if (isSettings) {
      return;
    }

    if (routeActivity && routeActivity.id !== activeActivityId) {
      setActiveActivityId(routeActivity.id);
      return;
    }

    if (
      activities.length > 0 &&
      !activities.some((activity) => activity.id === activeActivityId)
    ) {
      setActiveActivityId(activities[0].id);
    }
  }, [
    activeActivityId,
    activities,
    isSettings,
    routeActivity,
    setActiveActivityId,
  ]);

  const handleSelectActivity = (activity: INavigationActivity) => {
    navigate(`/${activity.defaultPath.replace(/^\/+/, '')}`);
  };

  const handleToggleActivity = (activity: INavigationActivity) => {
    if (expandedActivityId === activity.id) {
      setExpandedActivityId(null);
      return;
    }

    setExpandedActivityId(activity.id);

    if (routeActivityId !== activity.id) {
      handleSelectActivity(activity);
    }
  };

  const handleSelectInbox = () => {
    navigate(`/${AppPath.MyInbox}`);
  };

  return (
    <>
      <NavigationItemCountProbe activities={activities} />
      <NavigationActivityRail
        activities={activities}
        activeActivityId={isInboxActive ? null : activeActivity?.id || null}
        isInboxActive={isInboxActive}
        hiddenActivities={unlistedActivities}
        isActivityPinned={isActivityPinned}
        isSettings={isSettings}
        expandedActivityId={expandedActivityId}
        onActivityPinnedChange={setActivityPinned}
        onSearch={() => setSearchOpen(true)}
        onSelectInbox={handleSelectInbox}
        onSelectActivity={handleSelectActivity}
        onToggleActivity={handleToggleActivity}
        visibleActivities={listedActivities}
      />
    </>
  );
};
