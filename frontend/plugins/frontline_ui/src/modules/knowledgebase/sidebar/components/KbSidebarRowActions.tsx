import { IconDots, type Icon } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { Fragment } from 'react';

export type TKbSidebarAction = {
  value: string;
  icon: Icon;
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

export const KbSidebarRowActions = ({
  label,
  actions,
}: {
  label: string;
  actions: TKbSidebarAction[];
}) => (
  <DropdownMenu>
    <DropdownMenu.Trigger asChild>
      <Button
        variant="ghost"
        size="icon"
        aria-label={label}
        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 size-5 text-muted-foreground group-hover/kb-row:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
      >
        <IconDots />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content side="right" align="start" className="min-w-44">
      {actions.map((action) => (
        <Fragment key={action.value}>
          {action.destructive && <DropdownMenu.Separator />}
          <DropdownMenu.Item
            className={action.destructive ? 'text-destructive' : undefined}
            onSelect={action.onClick}
          >
            <action.icon />
            {action.label}
          </DropdownMenu.Item>
        </Fragment>
      ))}
    </DropdownMenu.Content>
  </DropdownMenu>
);
