import { IconForms, type Icon } from '@tabler/icons-react';
import { cn, Label, RecordTableInlineCell } from 'erxes-ui';
import { useId } from 'react';
import { PanelLabel } from './PanelLabel';

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
    <div className="grid grid-cols-field items-center gap-x-2 min-h-7">
      <Label id={labelId} htmlFor={htmlFor} variant="muted" className="flex min-w-0 items-center">
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
        {/* The value's trigger is named by the label, then its value ("Position Analyst"). */}
        <RecordTableInlineCell.LabelledBy value={labelId}>
          {children}
        </RecordTableInlineCell.LabelledBy>
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

// A table cell trigger with the panel's rounded hover.
export const PanelFieldTrigger = (
  props: React.ComponentProps<typeof RecordTableInlineCell.Trigger>,
) => <RecordTableInlineCell.Trigger variant="field" {...props} />;
