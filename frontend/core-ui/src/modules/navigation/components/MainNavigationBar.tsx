import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppPath } from '@/types/paths/AppPath';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NavigationActivityRail } from '@/navigation/components/NavigationActivityRail';
import { NavigationItemCountProbe } from '@/navigation/components/NavigationPlugins';
import { activePluginState } from 'erxes-ui';
import { expandedNavigationActivityState } from '@/navigation/states/navigationPanelState';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import { globalSearchOpenState } from '@/search/states/globalSearchState';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePinnedNavigationActivities } from '@/navigation/hooks/usePinnedNavigationActivities';

export const MainNavigationBar = () => {
  const activities = useNavigationActivities();
  const { isActivityPinned, setActivityPinned, visibleActivities } =
    usePinnedNavigationActivities(activities);
  const [activeActivityId, setActiveActivityId] = useAtom(activePluginState);
  const [expandedActivityIds, setExpandedActivityIds] = useAtom(
    expandedNavigationActivityState,
  );
  const setSearchOpen = useSetAtom(globalSearchOpenState);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isSettings = pathname.includes(`/${AppPath.Settings}`);
  const isInboxActive =
    pathname === `/${AppPath.MyInbox}` ||
    pathname.startsWith(`/${AppPath.MyInbox}/`);
  const isWelcomeActive = pathname === AppPath.WelcomeHome;
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
    setExpandedActivityIds((current) =>
      current.includes(routeActivityId)
        ? current
        : [...current, routeActivityId],
    );
  }, [routeActivityId, setExpandedActivityIds]);

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
    setActiveActivityId(activity.id);
    navigate(`/${activity.defaultPath.replace(/^\/+/, '')}`);
  };

  const handleToggleActivity = (activity: INavigationActivity) => {
    const isOpen = expandedActivityIds.includes(activity.id);

    setExpandedActivityIds((current) =>
      isOpen
        ? current.filter((id) => id !== activity.id)
        : [...current, activity.id],
    );

    if (!isOpen && routeActivityId !== activity.id) {
      handleSelectActivity(activity);
    }
  };

  const handleSelectInbox = () => {
    navigate(`/${AppPath.MyInbox}`);
  };

  const handleSelectWelcome = () => {
    navigate(AppPath.WelcomeHome);
  };

  return (
    <>
      <NavigationItemCountProbe activities={activities} />
      <NavigationActivityRail
        activities={activities}
        activeActivityId={
          isInboxActive || isWelcomeActive ? null : activeActivity?.id || null
        }
        isInboxActive={isInboxActive}
        isWelcomeActive={isWelcomeActive}
        hiddenActivities={unlistedActivities}
        isActivityPinned={isActivityPinned}
        isSettings={isSettings}
        expandedActivityIds={expandedActivityIds}
        onActivityPinnedChange={setActivityPinned}
        onSearch={() => setSearchOpen(true)}
        onSelectInbox={handleSelectInbox}
        onSelectWelcome={handleSelectWelcome}
        onSelectActivity={handleSelectActivity}
        onToggleActivity={handleToggleActivity}
        visibleActivities={listedActivities}
      />
    </>
  );
};
