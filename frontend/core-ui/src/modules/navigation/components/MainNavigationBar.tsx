import { NavigationPalette } from '@/navigation/components/NavigationPalette';
import { NavigationActivityRail } from '@/navigation/components/NavigationActivityRail';
import { NavigationPanel } from '@/navigation/components/NavigationPanel';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePinnedNavigationActivities } from '@/navigation/hooks/usePinnedNavigationActivities';
import {
  findNavigationActivityByPath,
  getRailNavigationActivities,
} from '@/navigation/utils/navigationActivities';
import { AppPath } from '@/types/paths/AppPath';
import { activePluginState, Sidebar } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const MainNavigationBar = () => {
  const activities = useNavigationActivities();
  const { isActivityPinned, setActivityPinned, visibleActivities } =
    usePinnedNavigationActivities(activities);
  const [activeActivityId, setActiveActivityId] = useAtom(activePluginState);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = Sidebar.useSidebar();
  const isSettings = pathname.includes(`/${AppPath.Settings}`);
  const isInboxActive =
    pathname === `/${AppPath.MyInbox}` ||
    pathname.startsWith(`/${AppPath.MyInbox}/`);
  const routeActivity = findNavigationActivityByPath(activities, pathname);
  const activeActivity =
    routeActivity ||
    activities.find((activity) => activity.id === activeActivityId) ||
    activities[0];
  const railActivities = getRailNavigationActivities({
    activities,
    visibleActivities,
    activeActivityId: routeActivity?.id,
  });
  const hasNavigationPanel = isSettings;

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

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, pathname, setOpenMobile]);

  useEffect(() => {
    const handleOpenPalette = (event: KeyboardEvent) => {
      if (
        event.metaKey !== event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        event.code === 'KeyM'
      ) {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleOpenPalette);

    return () => window.removeEventListener('keydown', handleOpenPalette);
  }, []);

  const handleSelectActivity = (activity: (typeof activities)[number]) => {
    navigate(`/${activity.defaultPath.replace(/^\/+/, '')}`);
  };

  /** Opens the Inbox activity. */
  const handleSelectInbox = () => {
    navigate(`/${AppPath.MyInbox}`);
  };

  return (
    <>
      <div className="flex h-full min-w-0">
        <NavigationActivityRail
          activities={activities}
          activeActivityId={isInboxActive ? null : activeActivity?.id || null}
          isInboxActive={isInboxActive}
          isActivityPinned={isActivityPinned}
          isSettings={isSettings}
          mobileExpanded={!hasNavigationPanel}
          onActivityPinnedChange={setActivityPinned}
          onSearch={() => setPaletteOpen(true)}
          onSelectInbox={handleSelectInbox}
          onSelectActivity={handleSelectActivity}
          visibleActivities={railActivities}
        />
        {isMobile && hasNavigationPanel && <NavigationPanel />}
      </div>
      <NavigationPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
};
