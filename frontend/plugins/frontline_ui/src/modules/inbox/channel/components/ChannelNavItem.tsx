import {
  Button,
  Collapsible,
  Sidebar,
  TextOverflowTooltip,
  cn,
} from 'erxes-ui';
import { IconCaretRightFilled, IconCheck } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { MembersInline } from 'ui-modules';
import type { IUser } from 'ui-modules';

export const ChannelNavItem = ({
  name,
  icon,
  isActive,
  onSelect,
  open,
  onOpenChange,
  unreadCount,
  members = [],
  collapsible = true,
  children,
}: {
  name: string;
  icon: ReactNode;
  isActive: boolean;
  onSelect: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  unreadCount: number;
  members?: IUser[];
  collapsible?: boolean;
  children: ReactNode;
}) => {
  const row = (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'justify-start gap-2 overflow-hidden text-left flex-auto min-w-0 py-2 pl-2 pr-2',
        unreadCount === 0 && !isActive && 'text-muted-foreground',
      )}
      onClick={onSelect}
    >
      {isActive ? <IconCheck className="size-3.5 shrink-0" /> : icon}
      <TextOverflowTooltip
        className="flex-1 min-w-0 font-semibold"
        value={name}
      />
      {members.length > 0 && (
        <MembersInline.Provider members={members} size="sm">
          <MembersInline.Avatar size="sm" />
        </MembersInline.Provider>
      )}
      {unreadCount > 0 && (
        <span className="shrink-0 px-1 text-xs rounded-sm bg-primary text-primary-foreground tabular-nums">
          {unreadCount}
        </span>
      )}
    </Button>
  );

  if (!collapsible) {
    return (
      <>
        <div className="flex items-center w-full">
          {row}
          <div className="shrink-0 size-6" aria-hidden />
        </div>
        <Sidebar.Menu>{children}</Sidebar.Menu>
      </>
    );
  }

  return (
    <Collapsible
      className="group/channel"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex items-center w-full">
        {row}
        <Collapsible.Trigger asChild>
          <Button
            variant="ghost"
            className="shrink-0 size-6 p-0"
            aria-label={name}
            aria-expanded={open}
          >
            <IconCaretRightFilled className="size-3 transition-transform group-data-[state=open]/channel:rotate-90 text-accent-foreground" />
          </Button>
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content>
        <Sidebar.Menu>{children}</Sidebar.Menu>
      </Collapsible.Content>
    </Collapsible>
  );
};
