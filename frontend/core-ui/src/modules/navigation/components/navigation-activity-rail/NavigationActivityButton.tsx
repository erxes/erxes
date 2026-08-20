import { NavigationActivityPinButton } from '@/navigation/components/NavigationActivityPinButton';
import { NavigationRailLabel } from '@/navigation/components/NavigationRailLabel';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconApps } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import type { ReactNode } from 'react';

export const NavigationActivityButton = ({
  activity,
  active,
  expanded,
  indicator,
  pinned,
  onPinnedChange,
  onSelect,
}: Readonly<{
  activity: INavigationActivity;
  active: boolean;
  expanded: boolean;
  indicator?: ReactNode;
  pinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  onSelect: () => void;
}>) => {
  const Icon = activity.icon || IconApps;

  return (
    <div className="group/activity relative flex h-7 w-full min-w-0 shrink-0">
      <Button
        aria-label={activity.label}
        className={cn(
          'relative h-7 min-w-0 shrink-0 justify-start gap-2 rounded-md text-sm transition-[width,margin,padding] duration-200 ease-linear [&>svg]:size-4!',
          expanded ? 'w-full px-2' : 'ml-0.5 w-7 px-1.5',
          expanded && onPinnedChange && 'pr-8',
          active && 'bg-primary/10 text-primary hover:bg-primary/10',
        )}
        onClick={onSelect}
        size="default"
        variant="ghost"
      >
        {active && (
          <span className="absolute -left-1 top-2 bottom-2 w-0.5 rounded-full bg-primary" />
        )}
        <Icon
          className={cn(
            'size-4 text-accent-foreground',
            active && 'text-primary',
          )}
        />
        <NavigationRailLabel
          className="truncate text-left font-medium"
          expanded={expanded}
        >
          {activity.label}
        </NavigationRailLabel>
        {expanded && indicator}
      </Button>
      {expanded && onPinnedChange && pinned !== undefined && (
        <NavigationActivityPinButton
          activity={activity}
          className="absolute top-0 right-0 opacity-0 group-focus-within/activity:opacity-100 group-hover/activity:opacity-100"
          pinned={pinned}
          onPinnedChange={onPinnedChange}
        />
      )}
    </div>
  );
};
