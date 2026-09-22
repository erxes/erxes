import { NavigationActivityButton } from '@/navigation/components/navigation-activity-rail/NavigationActivityButton';
import { NavigationActivityHover } from '@/navigation/components/navigation-activity-rail/NavigationActivityHover';
import { NavigationActivitySection } from '@/navigation/components/navigation-activity-rail/NavigationActivitySection';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const NavigationActivityGroups = ({
  activeActivityId,
  activities,
  expanded,
  hoverEnabled,
  isActivityPinned,
  isSettings,
  onActivityPinnedChange,
  onSelectActivity,
}: Readonly<{
  activeActivityId: string | null;
  activities: INavigationActivity[];
  expanded: boolean;
  hoverEnabled: boolean;
  isActivityPinned: (activityId: string) => boolean;
  isSettings: boolean;
  onActivityPinnedChange: (activityId: string, pinned: boolean) => void;
  onSelectActivity: (activity: INavigationActivity) => void;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
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

  const renderActivity = (activity: INavigationActivity) => {
    const active = !isSettings && activity.id === activeActivityId;
    const pinned = isActivityPinned(activity.id);
    const handlePinnedChange = (nextPinned: boolean) =>
      onActivityPinnedChange(activity.id, nextPinned);
    const handleSelect = () => onSelectActivity(activity);

    if (!hoverEnabled) {
      return (
        <NavigationActivityButton
          key={activity.id}
          activity={activity}
          active={active}
          expanded={expanded}
          pinned={pinned}
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
