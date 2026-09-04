import { NavigationActivityButton } from '@/navigation/components/navigation-activity-rail/NavigationActivityButton';
import { NavigationActivityGroups } from '@/navigation/components/navigation-activity-rail/NavigationActivityGroups';
import { NavigationActivitySearchButton } from '@/navigation/components/navigation-activity-rail/NavigationActivitySearchButton';
import { NavigationFavoritesSection } from '@/navigation/components/navigation-activity-rail/NavigationFavoritesSection';
import { NavigationInboxButton } from '@/navigation/components/navigation-activity-rail/NavigationInboxButton';
import { NavigationActivityMore } from '@/navigation/components/NavigationActivityMore';
import { NavigationRailLogo } from '@/navigation/components/NavigationRailLogo';
import { NavigationSidebarFooter } from '@/navigation/components/NavigationSidebarFooter';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { splitPromotedNavigationActivities } from '@/navigation/utils/promotedNavigationActivities';
import { cn, Sidebar } from 'erxes-ui';

export const NavigationActivityRail = ({
  activities,
  activeActivityId,
  isInboxActive,
  isActivityPinned,
  isSettings,
  mobileExpanded,
  onActivityPinnedChange,
  onSearch,
  onSelectInbox,
  onSelectActivity,
  visibleActivities,
}: Readonly<{
  activities: INavigationActivity[];
  activeActivityId: string | null;
  isInboxActive: boolean;
  isActivityPinned: (activityId: string) => boolean;
  isSettings: boolean;
  mobileExpanded: boolean;
  onActivityPinnedChange: (activityId: string, pinned: boolean) => void;
  onSearch: () => void;
  onSelectInbox: () => void;
  onSelectActivity: (activity: INavigationActivity) => void;
  visibleActivities: INavigationActivity[];
}>) => {
  const { isMobile, state } = Sidebar.useSidebar();
  const expanded = isMobile ? mobileExpanded : state === 'expanded';
  const hoverEnabled = !expanded && !isMobile;
  const { promoted, rest } = splitPromotedNavigationActivities(activities);
  const visibleRest = splitPromotedNavigationActivities(visibleActivities).rest;
  const usePromotedRail = promoted.length > 0;

  return (
    <aside
      className={cn(
        'flex w-full shrink-0 flex-col border-none bg-sidebar px-2 py-2',
        !expanded && 'border-r!',
        isMobile && !expanded && 'w-12',
      )}
    >
      <NavigationRailLogo expanded={expanded} />
      {usePromotedRail ? (
        <div className="mb-1 flex shrink-0 flex-col gap-1">
          <NavigationInboxButton
            expanded={expanded}
            isInboxActive={isInboxActive}
            onSelectInbox={onSelectInbox}
          />
          <NavigationActivitySearchButton
            expanded={expanded}
            onSearch={onSearch}
          />
          {promoted.map((activity) => (
            <NavigationActivityButton
              key={activity.id}
              activity={activity}
              active={!isSettings && activity.id === activeActivityId}
              expanded={expanded}
              onSelect={() => onSelectActivity(activity)}
            />
          ))}
        </div>
      ) : (
        <NavigationActivitySearchButton
          expanded={expanded}
          onSearch={onSearch}
        />
      )}
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col items-stretch gap-1 overflow-x-hidden overflow-y-auto',
          !expanded && 'hide-scroll',
        )}
      >
        <NavigationFavoritesSection
          expanded={expanded}
          isInboxActive={isInboxActive}
          onSelectInbox={onSelectInbox}
          showInbox={!usePromotedRail}
        />
        <NavigationActivityGroups
          activeActivityId={activeActivityId}
          activities={usePromotedRail ? visibleRest : visibleActivities}
          expanded={expanded}
          hoverEnabled={hoverEnabled}
          isActivityPinned={isActivityPinned}
          isSettings={isSettings}
          onActivityPinnedChange={onActivityPinnedChange}
          onSelectActivity={onSelectActivity}
        />
        <NavigationActivityMore
          activities={usePromotedRail ? rest : activities}
          expanded={expanded}
          isActivityPinned={isActivityPinned}
          onPinnedChange={onActivityPinnedChange}
          onSelect={onSelectActivity}
        />
      </div>
      <NavigationSidebarFooter expanded={expanded} isSettings={isSettings} />
    </aside>
  );
};
