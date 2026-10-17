import { Button, Popover, ScrollArea, cn } from 'erxes-ui';
import { IconApps, IconGridDots } from '@tabler/icons-react';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { splitPromotedNavigationActivities } from '@/navigation/utils/promotedNavigationActivities';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CoreTabAppSwitcherGroup = ({
  activeActivityId,
  activities,
  label,
  onSelect,
}: Readonly<{
  activeActivityId: string | null;
  activities: INavigationActivity[];
  label: string;
  onSelect: (activity: INavigationActivity) => void;
}>) => {
  if (activities.length === 0) {
    return null;
  }

  return (
    <section className="py-1 first:pt-0">
      <h2 className="flex h-7 items-center px-2 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h2>
      <div className="grid grid-cols-2 gap-0.5">
        {activities.map((activity) => {
          const Icon = activity.icon || IconApps;
          const active = activity.id === activeActivityId;

          return (
            <Button
              key={activity.id}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'h-8 min-w-0 justify-start gap-2 px-2 text-sm font-medium',
                active &&
                  'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
              )}
              onClick={() => onSelect(activity)}
              type="button"
              variant="ghost"
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{activity.label}</span>
            </Button>
          );
        })}
      </div>
    </section>
  );
};

/** Lists every plugin and core module; the tab row only fits so many. */
export const CoreTabAppSwitcher = ({
  activeActivityId,
  activities,
  onSelect,
}: Readonly<{
  activeActivityId: string | null;
  activities: INavigationActivity[];
  onSelect: (activity: INavigationActivity) => void;
}>) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { promoted, rest } = splitPromotedNavigationActivities(
    activities.filter((activity) => activity.kind === 'plugin'),
  );
  const coreActivities = activities.filter(
    (activity) => activity.kind === 'core',
  );

  const handleSelect = (activity: INavigationActivity) => {
    onSelect(activity);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          aria-label={t('open-plugin')}
          className="size-8 shrink-0"
          size="icon"
          title={t('open-plugin')}
          type="button"
          variant="ghost"
        >
          <IconGridDots className="size-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        className="flex max-h-[var(--radix-popover-content-available-height)] w-80 flex-col overflow-hidden rounded-xl border-border/60 p-1.5 shadow-lg"
        side="bottom"
        sideOffset={8}
      >
        <ScrollArea className="min-h-0 flex-auto">
          <CoreTabAppSwitcherGroup
            activeActivityId={activeActivityId}
            activities={[...promoted, ...rest]}
            label={t('plugins')}
            onSelect={handleSelect}
          />
          <CoreTabAppSwitcherGroup
            activeActivityId={activeActivityId}
            activities={coreActivities}
            label={t('core-modules')}
            onSelect={handleSelect}
          />
        </ScrollArea>
      </Popover.Content>
    </Popover>
  );
};
