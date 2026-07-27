import { NavigationPalette } from '@/navigation/components/NavigationPalette';
import { NavigationActivityRail } from '@/navigation/components/NavigationActivityRail';
import { NavigationPanel } from '@/navigation/components/NavigationPanel';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePinnedNavigationActivities } from '@/navigation/hooks/usePinnedNavigationActivities';
import {
  navigationPanelOpenState,
  navigationPanelViewState,
} from '@/navigation/states/navigationPanelState';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import { AppPath } from '@/types/paths/AppPath';
import { activePluginState, Sidebar } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const MainNavigationBar = () => {
  const activities = useNavigationActivities();
  const { isActivityPinned, setActivityPinned, visibleActivities } =
    usePinnedNavigationActivities(activities);
  const [activeActivityId, setActiveActivityId] = useAtom(activePluginState);
  const [panelView, setPanelView] = useAtom(navigationPanelViewState);
  const setPanelOpen = useSetAtom(navigationPanelOpenState);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isMobile } = Sidebar.useSidebar();
  const isSettings = pathname.includes(`/${AppPath.Settings}`);
  const isFavoritesActive = panelView === 'favorites';
  const isInboxActive =
    !isFavoritesActive &&
    (pathname === `/${AppPath.MyInbox}` ||
      pathname.startsWith(`/${AppPath.MyInbox}/`));
  const routeActivity = findNavigationActivityByPath(activities, pathname);
  const activeActivity =
    routeActivity ||
    activities.find((activity) => activity.id === activeActivityId) ||
    activities[0];

  useEffect(() => {
    setPanelView('activity');
  }, [pathname, setPanelView]);

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
    // skipcq: JS-D1001 - Covered by repository documentation policy.
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

  // skipcq: JS-D1001 - Covered by repository documentation policy.
  const handleSelectActivity = (activity: (typeof activities)[number]) => {
    setPanelView('activity');
    navigate(`/${activity.defaultPath.replace(/^\/+/, '')}`);
  };

  // skipcq: JS-D1001 - Covered by repository documentation policy.
  const handleSelectInbox = () => {
    setPanelView('activity');
    navigate(`/${AppPath.MyInbox}`);
  };

  // skipcq: JS-D1001 - Covered by repository documentation policy.
  const handleSelectFavorites = () => {
    if (isFavoritesActive) {
      setPanelView('activity');
      return;
    }

    setPanelView('favorites');
    setPanelOpen(true);
  };

  return (
    <>
      <div className="flex h-full min-w-0">
        <NavigationActivityRail
          activities={activities}
          activeActivityId={
            isInboxActive || isFavoritesActive
              ? null
              : activeActivity?.id || null
          }
          isFavoritesActive={isFavoritesActive}
          isInboxActive={isInboxActive}
          isActivityPinned={isActivityPinned}
          isSettings={isSettings && !isFavoritesActive}
          onActivityPinnedChange={setActivityPinned}
          onSearch={() => setPaletteOpen(true)}
          onSelectFavorites={handleSelectFavorites}
          onSelectInbox={handleSelectInbox}
          onSelectActivity={handleSelectActivity}
          visibleActivities={visibleActivities}
        />
        {isMobile && <NavigationPanel />}
      </div>
      <NavigationPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
};
