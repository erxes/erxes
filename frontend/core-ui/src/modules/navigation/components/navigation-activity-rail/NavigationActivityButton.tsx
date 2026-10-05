import { NavigationActivityPinButton } from '@/navigation/components/NavigationActivityPinButton';
import { NavigationRailLabel } from '@/navigation/components/NavigationRailLabel';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconApps, IconChevronRight } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import type { ReactNode } from 'react';

export const NavigationActivityButton = ({
  activity,
  active,
  expanded,
  indicator,
  open,
  pinned,
  onPinnedChange,
  onSelect,
}: Readonly<{
  activity: INavigationActivity;
  active: boolean;
  expanded: boolean;
  indicator?: ReactNode;
  open?: boolean;
  pinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  onSelect: () => void;
}>) => {
  const Icon = activity.icon || IconApps;
  const expandable = open !== undefined;
  const showPinButton = Boolean(
    expanded && onPinnedChange && pinned !== undefined,
  );

  return (
    <div className="group/activity relative flex h-7 w-full min-w-0 shrink-0">
      <Button
        aria-expanded={expandable ? open : undefined}
        aria-label={activity.label}
        className={cn(
          'relative h-7 min-w-0 shrink-0 justify-start gap-2 rounded-lg text-sm transition-[width,margin,padding] duration-200 ease-linear [&>svg]:size-4!',
          expanded ? 'w-full px-2' : 'ml-0.5 w-7 px-1.5',
          showPinButton && !expandable && 'pr-8',
          active && 'bg-foreground/5 text-foreground hover:bg-foreground/5',
        )}
        onClick={onSelect}
        size="default"
        variant="ghost"
      >
        <Icon
          className={cn(
            'size-4 text-accent-foreground transition-transform group-active/activity:scale-90',
            active &&
              'animate-icon-pop text-foreground motion-reduce:animate-none',
          )}
        />
        <NavigationRailLabel
          className={cn(
            'truncate text-left',
            active ? 'font-medium' : 'font-normal',
            showPinButton &&
              expandable &&
              'group-focus-within/activity:mr-6 group-hover/activity:mr-6',
          )}
          expanded={expanded}
        >
          {activity.label}
        </NavigationRailLabel>
        {indicator}
        {expanded && expandable && (
          <span
            className={cn(
              'ml-auto flex shrink-0 text-muted-foreground transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
              open && 'rotate-90',
            )}
          >
            <IconChevronRight className="size-3.5!" />
          </span>
        )}
      </Button>
      {expanded && onPinnedChange && pinned !== undefined && (
        <NavigationActivityPinButton
          activity={activity}
          className={cn(
            'absolute top-0 opacity-0 group-focus-within/activity:opacity-100 group-hover/activity:opacity-100',
            expandable ? 'right-6' : 'right-0',
          )}
          pinned={pinned}
          onPinnedChange={onPinnedChange}
        />
      )}
    </div>
  );
};
