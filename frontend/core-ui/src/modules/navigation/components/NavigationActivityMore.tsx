import { NavigationActivityPinButton } from '@/navigation/components/NavigationActivityPinButton';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconApps, IconDots } from '@tabler/icons-react';
import { Button, cn, Popover, ScrollArea, Separator } from 'erxes-ui';
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
    <section>
      <h2 className="px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
        {label}
      </h2>
      <div className="flex flex-col gap-0.5">
        {activities.map((activity) => {
          const Icon = activity.icon || IconApps;

          return (
            <div
              className="flex min-w-0 items-center rounded-md hover:bg-accent"
              key={activity.id}
            >
              <Button
                className="h-8 min-w-0 flex-1 justify-start gap-2 px-2 text-sm"
                onClick={() => onSelect(activity)}
                type="button"
                variant="ghost"
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{activity.label}</span>
              </Button>
              <NavigationActivityPinButton
                activity={activity}
                className="mr-0.5"
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
          className={cn(
            'shrink-0 rounded-md [&>svg]:size-4!',
            expanded
              ? 'h-7 w-full justify-start gap-2 px-2 text-sm'
              : 'size-7 justify-center px-0',
          )}
          size={expanded ? 'default' : 'icon'}
          type="button"
          variant="ghost"
        >
          <IconDots className="size-4 text-accent-foreground" />
          {expanded && (
            <span className="truncate font-medium">{t('more')}</span>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        className="flex max-h-[var(--radix-popover-content-available-height)] w-64 flex-col overflow-hidden p-1"
        side="right"
        sideOffset={4}
      >
        <div className="shrink-0 px-2 py-1.5 text-sm font-semibold">
          {t('more')}
        </div>
        <ScrollArea className="min-h-0 flex-auto">
          <NavigationActivityMoreGroup
            activities={pluginActivities}
            isActivityPinned={isActivityPinned}
            label={t('plugins')}
            onPinnedChange={onPinnedChange}
            onSelect={selectActivity}
          />
          {pluginActivities.length > 0 && coreActivities.length > 0 && (
            <Separator className="my-1" />
          )}
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
