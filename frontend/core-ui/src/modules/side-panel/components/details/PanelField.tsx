import { cn, RecordTableInlineCell } from 'erxes-ui';
import { forwardRef } from 'react';

// One field in the side panel: its label, then the value as a record table
// cell. Click to edit; Enter saves and Escape cancels, as in the list.
export const PanelField = ({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-2 min-h-8">
    <span className="truncate font-mono text-xs font-semibold uppercase text-accent-foreground">
      {label}
    </span>
    <div className="min-w-0">{children}</div>
  </div>
);

// A table cell trigger with the panel's rounded hover.
export const PanelFieldTrigger = forwardRef<
  React.ElementRef<typeof RecordTableInlineCell.Trigger>,
  React.ComponentPropsWithoutRef<typeof RecordTableInlineCell.Trigger>
>(({ className, ...props }, ref) => (
  <RecordTableInlineCell.Trigger
    ref={ref}
    className={cn('rounded-sm font-normal', className)}
    {...props}
  />
));
PanelFieldTrigger.displayName = 'PanelFieldTrigger';

// Text fields from erxes-ui draw a shadow; in the panel they stay flat.
export const PANEL_TEXT_FIELD_CLASS_NAME = 'rounded-sm shadow-none font-normal';
