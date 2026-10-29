import { cn, Label, Tooltip } from 'erxes-ui';
import { IDataExtensionField } from '../types';

/**
 * A field's label in a side panel row: the panel's label style, with the
 * field's description on hover so the row stays one line tall.
 */
export const DataExtensionFieldLabel = ({
  field,
  htmlFor,
  className,
}: {
  field: IDataExtensionField;
  htmlFor: string;
  className?: string;
}) => {
  const label = (
    <Label
      htmlFor={htmlFor}
      className={cn(
        'truncate text-xs font-medium text-accent-foreground',
        field.description && 'cursor-help',
        className,
      )}
    >
      {field.label}
    </Label>
  );

  if (!field.description) {
    return label;
  }

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={300}>
        <Tooltip.Trigger asChild>{label}</Tooltip.Trigger>
        <Tooltip.Content side="left" className="max-w-64">
          {field.description}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
