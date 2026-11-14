import { IconForms, type Icon } from '@tabler/icons-react';
import { cn, Label, RecordTableInlineCell } from 'erxes-ui';
import { type ComponentProps, type ReactNode } from 'react';

// One field in the side panel: its label, then
// the value as a record table cell. Click to edit; Enter saves, Escape cancels.
export const PanelField = ({
  label,
  icon: FieldIcon = IconForms,
  children,
}: {
  label: ReactNode;
  icon?: Icon;
  children: ReactNode;
}) => (
  <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-2 min-h-7">
    <Label
      variant="muted"
      className="flex min-w-0 items-center"
    >
      <FieldIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="my-1 block min-w-0 wrap-break-word line-clamp-2">{label}</span>
    </Label>
    {/* Record table cells are 32px and 14px; the panel's rows are a little tighter. */}
    <div
      className={cn(
        'relative min-w-0',
        'text-xs [&_button:not([role=switch],[data-panel-inline])]:h-7 [&_button:not([role=switch])]:text-xs [&_input]:text-xs',
      )}
    >
      {children}
    </div>
  </div>
);

// A table cell trigger with the panel's rounded hover.
export const PanelFieldTrigger = ({
  ref,
  ...props
}: ComponentProps<typeof RecordTableInlineCell.Trigger>) => (
  <RecordTableInlineCell.Trigger ref={ref} variant="field" {...props} />
);
