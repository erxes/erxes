import { NavigationCorePanelContent } from '@/navigation/components/NavigationCoreModules';
import { NavigationPluginPanelContent } from '@/navigation/components/NavigationPlugins';
import { NavigationRailLogo } from '@/navigation/components/NavigationRailLogo';
import { NavigationSidebarFooter } from '@/navigation/components/NavigationSidebarFooter';
import { visitedPageTabsState } from '@/navigation/states/visitedPageTabsState';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { doesNavigationActivityMatchPath } from '@/navigation/utils/navigationActivities';
import { IconApps } from '@tabler/icons-react';
import { Button, cn, HoverCard, ScrollArea, Sidebar } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

const NavigationActivityPeek = ({
  activity,
  onPin,
}: {
  activity: INavigationActivity;
  onPin: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <HoverCard.Content
      align="start"
      className="flex max-h-[calc(100svh-4rem)] w-60 flex-col overflow-hidden p-0"
      side="right"
      sideOffset={6}
      onClick={onPin}
    >
      <div className="flex h-10 shrink-0 items-center border-b px-3">
        <span className="truncate text-[13px] font-semibold">
          {activity.label}
        </span>
      </div>
      <ScrollArea className="min-h-0 flex-1 py-1">
        {activity.kind === 'plugin' ? (
          <NavigationPluginPanelContent activityId={activity.id} />
        ) : (
          <NavigationCorePanelContent activity={activity} />
        )}
      </ScrollArea>
      <div className="shrink-0 border-t px-3 py-2 text-[11px] text-accent-foreground">
        {t('pin-panel')}
      </div>
    </HoverCard.Content>
  );
};

const NavigationActivityButton = ({
  activity,
  active,
  openInTabs,
  onSelect,
}: {
  activity: INavigationActivity;
  active: boolean;
  openInTabs: boolean;
  onSelect: () => void;
}) => {
  const Icon = activity.icon || IconApps;

  return (
    <Button
      aria-label={activity.label}
      className={cn(
        'relative h-[38px] w-10 rounded-md text-accent-foreground',
        active && 'bg-primary/10 text-primary hover:bg-primary/10',
      )}
      onClick={onSelect}
      size="icon"
      title={activity.label}
      variant="ghost"
    >
      {active && (
        <span className="absolute -left-1 top-2 bottom-2 w-0.5 rounded-full bg-primary" />
      )}
      <Icon className="size-[19px]" />
      {openInTabs && !active && (
        <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent-foreground" />
      )}
    </Button>
  );
};

export const NavigationActivityRail = ({
  activities,
  activeActivityId,
  isSettings,
  onSelectActivity,
}: {
  activities: INavigationActivity[];
  activeActivityId: string | null;
  isSettings: boolean;
  onSelectActivity: (activity: INavigationActivity) => void;
}) => {
  const tabs = useAtomValue(visitedPageTabsState);
  const { setOpen } = Sidebar.useSidebar();

  return (
    <aside className="flex w-12 shrink-0 flex-col items-center border-r bg-sidebar px-1 py-2">
      <NavigationRailLogo />
      <div className="flex min-h-0 flex-1 flex-col items-center gap-0.5 overflow-y-auto overflow-x-hidden">
        {activities.map((activity) => {
          const active = !isSettings && activity.id === activeActivityId;
          const button = (
            <NavigationActivityButton
              activity={activity}
              active={active}
              openInTabs={tabs.some((tab) =>
                doesNavigationActivityMatchPath(activity, tab.pathname),
              )}
              onSelect={() => onSelectActivity(activity)}
            />
          );

          return (
            <HoverCard key={activity.id} openDelay={120} closeDelay={220}>
              <HoverCard.Trigger asChild>{button}</HoverCard.Trigger>
              <NavigationActivityPeek
                activity={activity}
                onPin={() => setOpen(true)}
              />
            </HoverCard>
          );
        })}
      </div>
      <NavigationSidebarFooter isSettings={isSettings} />
    </aside>
  );
};
