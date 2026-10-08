import { Button, cn } from 'erxes-ui';
import { IconApps, IconChevronRight } from '@tabler/icons-react';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NavigationActivityActions } from '@/navigation/components/navigation-activity-rail/NavigationActivityActions';
import { NavigationRailLabel } from '@/navigation/components/navigation-activity-rail/NavigationRailLabel';
import type { ReactNode } from 'react';
import { TNavigationActivityMoveDirection } from '@/navigation/utils/navigationActivityOrder';

export const NavigationActivityButton = ({
  activity,
  active,
  canMoveDown = false,
  canMoveUp = false,
  expanded,
  indicator,
  open,
  pinned,
  onMove,
  onPinnedChange,
  onSelect,
}: Readonly<{
  activity: INavigationActivity;
  active: boolean;
  canMoveDown?: boolean;
  canMoveUp?: boolean;
  expanded: boolean;
  indicator?: ReactNode;
  open?: boolean;
  pinned?: boolean;
  onMove?: (direction: TNavigationActivityMoveDirection) => void;
  onPinnedChange?: (pinned: boolean) => void;
  onSelect: () => void;
}>) => {
  const Icon = activity.icon || IconApps;
  const expandable = open !== undefined;
  const showPinButton = Boolean(
    expanded && onPinnedChange && onMove && pinned !== undefined,
  );

  return (
    <div className="group/activity relative flex h-7 w-full min-w-0 shrink-0">
      <Button
        aria-expanded={expandable ? open : undefined}
        aria-label={activity.label}
        data-nav-row
        className={cn(
          'relative h-7 min-w-0 shrink-0 justify-start gap-2 rounded text-sm transition-[width,margin,padding,color,background-color] duration-200 ease-out motion-reduce:transition-none [&>svg]:size-4!',
          expanded ? 'w-full px-2' : 'ml-0.5 w-7 px-1.5',
          active && expandable && 'text-primary hover:text-primary',
          active &&
            !expandable &&
            'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
        )}
        onClick={onSelect}
        size="default"
        variant="ghost"
      >
        <Icon
          className={cn(
            'size-4 text-current',
            active &&
              'animate-icon-pop text-primary motion-reduce:animate-none',
          )}
        />
        <NavigationRailLabel
          className={cn(
            'truncate text-left',
            'font-medium',
            showPinButton && 'mr-12',
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
              active && 'text-primary',
              open && 'rotate-90',
            )}
          >
            <IconChevronRight className="size-3.5!" />
          </span>
        )}
      </Button>
      {showPinButton && onPinnedChange && onMove && pinned !== undefined && (
        <NavigationActivityActions
          canMoveDown={canMoveDown}
          canMoveUp={canMoveUp}
          className={expandable ? 'right-6' : 'right-1'}
          path={`/${activity.defaultPath.replace(/^\/+/, '')}`}
          pinned={pinned}
          onMove={onMove}
          onPinnedChange={onPinnedChange}
        />
      )}
    </div>
  );
};
