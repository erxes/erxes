import { useEffect, useState } from 'react';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NavigationActivityAccordion } from '@/navigation/components/navigation-activity-rail/NavigationActivityAccordion';
import { NavigationActivityButton } from '@/navigation/components/navigation-activity-rail/NavigationActivityButton';
import { NavigationActivityHover } from '@/navigation/components/navigation-activity-rail/NavigationActivityHover';
import { NavigationActivitySection } from '@/navigation/components/navigation-activity-rail/NavigationActivitySection';
import { Sidebar } from 'erxes-ui';
import { TNavigationActivityMoveDirection } from '@/navigation/utils/navigationActivityOrder';
import { useNavigationPlacement } from '@/navigation/hooks/useNavigationPlacement';
import { usePluginsNavigationGroups } from '@/navigation/hooks/usePluginsNavigationGroups';
import { useTranslation } from 'react-i18next';

export const NavigationActivityGroups = ({
  activeActivityId,
  activities,
  expanded,
  expandedActivityIds,
  hoverEnabled,
  isActivityPinned,
  isSettings,
  onActivityMove,
  onActivityPinnedChange,
  onSelectActivity,
  onToggleActivity,
}: Readonly<{
  activeActivityId: string | null;
  activities: INavigationActivity[];
  expanded: boolean;
  expandedActivityIds: string[];
  hoverEnabled: boolean;
  isActivityPinned: (activityId: string) => boolean;
  isSettings: boolean;
  onActivityMove: (
    activityId: string,
    direction: TNavigationActivityMoveDirection,
    scopeActivityIds: string[],
  ) => void;
  onActivityPinnedChange: (activityId: string, pinned: boolean) => void;
  onSelectActivity: (activity: INavigationActivity) => void;
  onToggleActivity: (activity: INavigationActivity) => void;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const navigationGroups = usePluginsNavigationGroups();
  const { isMobile } = Sidebar.useSidebar();
  const getPlacement = useNavigationPlacement();
  const [previewActivityId, setPreviewActivityId] = useState<string | null>(
    null,
  );
  const pluginActivities = activities.filter(
    (activity) => activity.kind === 'plugin',
  );
  const coreActivities = activities.filter(
    (activity) => activity.kind === 'core',
  );

  useEffect(() => {
    if (!hoverEnabled) {
      setPreviewActivityId(null);
    }
  }, [hoverEnabled]);

  const hasInlineModules = (activity: INavigationActivity) => {
    if (activity.kind === 'core') {
      return activity.modules.some((module) => module.submenus?.length);
    }

    const navigationGroup = navigationGroups[activity.id];
    const hasModules = Boolean(
      navigationGroup?.contents.length ||
        (isMobile && navigationGroup?.subGroups.length),
    );

    return hasModules && getPlacement(activity.id) === 'inline';
  };

  const renderActivity = (activity: INavigationActivity) => {
    const active = !isSettings && activity.id === activeActivityId;
    const pinned = isActivityPinned(activity.id);
    const handlePinnedChange = (nextPinned: boolean) =>
      onActivityPinnedChange(activity.id, nextPinned);
    const handleSelect = () => onSelectActivity(activity);
    const scope =
      activity.kind === 'plugin' ? pluginActivities : coreActivities;
    const scopeIds = scope.map((item) => item.id);
    const scopeIndex = scopeIds.indexOf(activity.id);
    const canMoveUp = scopeIndex > 0;
    const canMoveDown = scopeIndex < scopeIds.length - 1;
    const handleMove = (direction: TNavigationActivityMoveDirection) =>
      onActivityMove(activity.id, direction, scopeIds);

    if (expanded && hasInlineModules(activity)) {
      return (
        <NavigationActivityAccordion
          key={activity.id}
          activity={activity}
          active={active}
          canMoveDown={canMoveDown}
          canMoveUp={canMoveUp}
          open={expandedActivityIds.includes(activity.id)}
          pinned={pinned}
          onMove={handleMove}
          onPinnedChange={handlePinnedChange}
          onToggle={() => onToggleActivity(activity)}
        />
      );
    }

    if (!hoverEnabled) {
      return (
        <NavigationActivityButton
          key={activity.id}
          activity={activity}
          active={active}
          canMoveDown={canMoveDown}
          canMoveUp={canMoveUp}
          expanded={expanded}
          pinned={pinned}
          onMove={handleMove}
          onPinnedChange={handlePinnedChange}
          onSelect={handleSelect}
        />
      );
    }

    return (
      <NavigationActivityHover
        key={activity.id}
        activity={activity}
        active={active}
        expanded={expanded}
        open={previewActivityId === activity.id}
        pinned={pinned}
        onClose={() =>
          setPreviewActivityId((currentActivityId) =>
            currentActivityId === activity.id ? null : currentActivityId,
          )
        }
        onOpen={() => setPreviewActivityId(activity.id)}
        onPinnedChange={handlePinnedChange}
        onSelect={handleSelect}
      />
    );
  };

  return (
    <>
      {pluginActivities.length > 0 && (
        <NavigationActivitySection expanded={expanded} label={t('plugins')}>
          {pluginActivities.map(renderActivity)}
        </NavigationActivitySection>
      )}
      {coreActivities.length > 0 && (
        <NavigationActivitySection
          expanded={expanded}
          label={t('core-modules')}
        >
          {coreActivities.map(renderActivity)}
        </NavigationActivitySection>
      )}
    </>
  );
};
