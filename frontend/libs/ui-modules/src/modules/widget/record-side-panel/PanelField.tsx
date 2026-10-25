import { cn, RecordTableInlineCell } from 'erxes-ui';
import { forwardRef } from 'react';

// One field in the side panel: its label, then the value as a record table
// cell. Click to edit; Enter saves and Escape cancels, as in the list.
export const PanelField = ({
  label,
  children,
  cell = true,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  // The value is a record table cell, tightened to the panel's rows; off for
  // values with their own layout (e.g. an avatar upload).
  cell?: boolean;
}) => (
  <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-2 min-h-7">
    <span className="truncate text-xs font-medium text-accent-foreground">
      {label}
    </span>
    {/* Record table cells are 32px and 14px; the panel's rows are a little
        tighter and their values the size of their labels. Switches and
        smaller inline controls (`data-panel-inline`, e.g. relation chips)
        keep their own height. */}
    <div
      className={cn(
        'min-w-0',
        cell &&
          'text-xs [&_button:not([role=switch],[data-panel-inline])]:h-7 [&_button:not([role=switch])]:text-xs [&_input]:text-xs',
      )}
    >
      {children}
    </div>
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
