import { Icon } from '@tabler/icons-react';
import { ScrollArea, Separator } from 'erxes-ui';

export const RelationWidgetEmptyState = ({
  icon: EmptyIcon,
  message,
  children,
}: {
  icon: Icon;
  message: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
    <div className="border border-dashed p-6 bg-background rounded-xl">
      <EmptyIcon />
    </div>
    <span className="text-sm">{message}</span>
    {children}
  </div>
);

// The header and scrolling list every relation widget shows once it has items.
export const RelationWidgetList = ({
  label,
  actions,
  dense = false,
  children,
}: {
  label: React.ReactNode;
  actions?: React.ReactNode;
  // One-line rows (e.g. `ContactWidgetRow`) instead of cards.
  dense?: boolean;
  children: React.ReactNode;
}) => (
  <>
    <div
      data-side-menu-header=""
      className="h-11 px-4 flex items-center gap-2 flex-none bg-background justify-between"
    >
      <span className="font-medium text-primary">{label}</span>
      {actions && <div className="flex gap-2 items-center">{actions}</div>}
    </div>
    <Separator />
    <ScrollArea className="flex-auto">
      <div
        className={
          dense ? 'flex flex-col gap-0.5 p-1.5' : 'flex flex-col gap-4 p-4'
        }
      >
        {children}
      </div>
    </ScrollArea>
  </>
);
