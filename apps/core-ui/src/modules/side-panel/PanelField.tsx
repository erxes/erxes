import { IconForms, type Icon } from '@tabler/icons-react';
import { cn, Label, RecordTableInlineCell } from 'erxes-ui';
import { createContext, use, useId } from 'react';
import { PanelLabel } from './PanelLabel';

/** The id of the field's label while its value is empty (the placeholder shows instead). */
const EmptyFieldLabel = createContext<string | undefined>(undefined);

// One field in the side panel: its label, then the value as a record table
// cell. Click to edit; Enter saves and Escape cancels, as in the list.
export const PanelField = ({
  label,
  icon: Icon = IconForms,
  children,
  placeholder,
  htmlFor,
  cell = true,
}: {
  label: React.ReactNode;
  icon?: Icon;
  placeholder?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  // The value is a record table cell, tightened to the panel's rows; off for
  // values with their own layout (e.g. an avatar upload).
  cell?: boolean;
}) => {
  const labelId = useId();

  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-2 min-h-7">
      <Label
        id={labelId}
        htmlFor={htmlFor}
        variant="peer"
        className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-accent-foreground"
      >
        {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
        <PanelLabel>{label}</PanelLabel>
      </Label>
      {/* Record table cells are 32px and 14px; the panel's rows are a little
        tighter and their values the size of their labels. Switches and
        smaller inline controls (`data-panel-inline`, e.g. relation chips)
        keep their own height. */}
      <div
        className={cn(
          'relative min-w-0',
          cell &&
            'text-xs [&_button:not([role=switch],[data-panel-inline])]:h-7 [&_button:not([role=switch])]:text-xs [&_input]:text-xs',
        )}
      >
        <EmptyFieldLabel value={placeholder ? labelId : undefined}>{children}</EmptyFieldLabel>
        {placeholder && (
          <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
};

// A table cell trigger with the panel's rounded hover. Empty, it shows no text
// of its own, so screen readers name it by the field's label.
export const PanelFieldTrigger = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof RecordTableInlineCell.Trigger>) => (
  <RecordTableInlineCell.Trigger
    ref={ref}
    aria-labelledby={use(EmptyFieldLabel)}
    className={cn('rounded-sm font-normal', className)}
    {...props}
  />
);

// Text fields from erxes-ui draw a shadow; in the panel they stay flat.
export const PANEL_TEXT_FIELD_CLASS_NAME = 'rounded-sm shadow-none font-normal';
