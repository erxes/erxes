import { NavigationActivityRail } from '@/navigation/components/NavigationActivityRail';
import { NavigationPanel } from '@/navigation/components/NavigationPanel';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import { AppPath } from '@/types/paths/AppPath';
import { activePluginState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const MainNavigationBar = () => {
  const activities = useNavigationActivities();
  const [activeActivityId, setActiveActivityId] = useAtom(activePluginState);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isSettings = pathname.includes(`/${AppPath.Settings}`);
  const routeActivity = findNavigationActivityByPath(activities, pathname);
  const activeActivity =
    routeActivity ||
    activities.find((activity) => activity.id === activeActivityId) ||
    activities[0];

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

  const handleSelectActivity = (activity: (typeof activities)[number]) => {
    navigate(`/${activity.defaultPath.replace(/^\/+/, '')}`);
  };

  return (
    <div className="flex h-full min-w-0">
      <NavigationActivityRail
        activities={activities}
        activeActivityId={activeActivity?.id || null}
        isSettings={isSettings}
        onSelectActivity={handleSelectActivity}
      />
      <NavigationPanel activity={activeActivity} isSettings={isSettings} />
    </div>
  );
};
