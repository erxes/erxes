import { NavigationActivityGroups } from '@/navigation/components/navigation-activity-rail/NavigationActivityGroups';
import { NavigationActivitySearchButton } from '@/navigation/components/navigation-activity-rail/NavigationActivitySearchButton';
import { NavigationFavoritesSection } from '@/navigation/components/navigation-activity-rail/NavigationFavoritesSection';
import { NavigationActivityMore } from '@/navigation/components/NavigationActivityMore';
import { NavigationRailLogo } from '@/navigation/components/NavigationRailLogo';
import { NavigationSidebarFooter } from '@/navigation/components/NavigationSidebarFooter';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
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

  return (
    <aside
      className={cn(
        'flex w-full shrink-0 flex-col border-none bg-sidebar px-2 py-2',
        !expanded && 'border-r!',
        isMobile && !expanded && 'w-12',
      )}
    >
      <NavigationRailLogo expanded={expanded} />
      <NavigationActivitySearchButton expanded={expanded} onSearch={onSearch} />
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
        />
        <NavigationActivityGroups
          activeActivityId={activeActivityId}
          activities={visibleActivities}
          expanded={expanded}
          hoverEnabled={hoverEnabled}
          isActivityPinned={isActivityPinned}
          isSettings={isSettings}
          onActivityPinnedChange={onActivityPinnedChange}
          onSelectActivity={onSelectActivity}
        />
        <NavigationActivityMore
          activities={activities}
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
