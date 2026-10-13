import { Button, Popover, ScrollArea, Sidebar, cn } from 'erxes-ui';
import { IconApps, IconDots } from '@tabler/icons-react';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NavigationActivityPinButton } from '@/navigation/components/navigation-activity-rail/NavigationActivityPinButton';
import { NavigationRailLabel } from '@/navigation/components/navigation-activity-rail/NavigationRailLabel';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const NavigationActivityMoreGroup = ({
  activities,
  isActivityPinned,
  label,
  onPinnedChange,
  onSelect,
}: {
  activities: INavigationActivity[];
  isActivityPinned: (activityId: string) => boolean;
  label: string;
  onPinnedChange: (activityId: string, pinned: boolean) => void;
  onSelect: (activity: INavigationActivity) => void;
}) => {
  if (activities.length === 0) {
    return null;
  }

  return (
    <section className="py-1 first:pt-0">
      <h2 className="flex h-7 items-center px-2 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h2>
      <div className="flex flex-col gap-0.5">
        {activities.map((activity) => {
          const Icon = activity.icon || IconApps;

          return (
            <div
              className="group/more flex h-8 min-w-0 items-center rounded transition-colors duration-150 hover:bg-accent"
              key={activity.id}
            >
              <Button
                data-nav-row
                className="h-8 min-w-0 flex-1 justify-start gap-2 px-2 text-sm font-medium hover:bg-transparent"
                onClick={() => onSelect(activity)}
                type="button"
                variant="ghost"
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{activity.label}</span>
              </Button>
              <NavigationActivityPinButton
                activity={activity}
                className="mr-1 opacity-0 [@media(hover:none)]:opacity-100 transition-opacity duration-150 group-hover/more:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none"
                pinned={isActivityPinned(activity.id)}
                onPinnedChange={(pinned) => onPinnedChange(activity.id, pinned)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const NavigationActivityMore = ({
  activities,
  expanded,
  isActivityPinned,
  onPinnedChange,
  onSelect,
}: {
  activities: INavigationActivity[];
  expanded: boolean;
  isActivityPinned: (activityId: string) => boolean;
  onPinnedChange: (activityId: string, pinned: boolean) => void;
  onSelect: (activity: INavigationActivity) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { isMobile } = Sidebar.useSidebar();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const pluginActivities = activities.filter(
    (activity) => activity.kind === 'plugin',
  );
  const coreActivities = activities.filter(
    (activity) => activity.kind === 'core',
  );

  if (activities.length === 0) {
    return null;
  }

  const selectActivity = (activity: INavigationActivity) => {
    onSelect(activity);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          aria-label={t('more-activities')}
          data-nav-row
          className={cn(
            'h-7 shrink-0 justify-start gap-2 rounded text-sm transition-[width,margin,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [&>svg]:size-4!',
            expanded ? 'w-full px-2' : 'ml-0.5 w-7 px-1.5',
          )}
          size="default"
          type="button"
          variant="ghost"
        >
          <IconDots className="size-4" />
          <NavigationRailLabel
            className="truncate font-medium"
            expanded={expanded}
          >
            {t('more')}
          </NavigationRailLabel>
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        className="flex max-h-[var(--radix-popover-content-available-height)] w-60 flex-col overflow-hidden rounded-xl border-border/60 p-1.5 shadow-lg"
        side={isMobile && expanded ? 'bottom' : 'right'}
        sideOffset={8}
      >
        <ScrollArea className="min-h-0 flex-auto">
          <NavigationActivityMoreGroup
            activities={pluginActivities}
            isActivityPinned={isActivityPinned}
            label={t('plugins')}
            onPinnedChange={onPinnedChange}
            onSelect={selectActivity}
          />
          <NavigationActivityMoreGroup
            activities={coreActivities}
            isActivityPinned={isActivityPinned}
            label={t('core-modules')}
            onPinnedChange={onPinnedChange}
            onSelect={selectActivity}
          />
        </ScrollArea>
      </Popover.Content>
    </Popover>
  );
};
