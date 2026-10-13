import { IconCheck } from '@tabler/icons-react';
import { IconComponent, Label, Spinner } from 'erxes-ui';
import { TFieldSaveState } from '../hooks/useFieldSaveState';
import { IField } from '../types/fieldsTypes';
import { formatValidationLabel, hasFieldValue } from '../propertyUtils';

// The property form's default icon, stored either way, i.e. none was picked.
const DEFAULT_ICONS = new Set(['123', 'Icon123']);

export const FieldLabel = ({
  field,
  children,
  id,
  inCell,
  value,
  error,
  saveState = 'idle',
}: {
  field: IField;
  children: React.ReactNode;
  id: string;
  inCell?: boolean;
  value?: unknown;
  error?: string | null;
  saveState?: TFieldSaveState;
}) => {
  if (inCell) {
    return children;
  }

  // two sources say "required": `validations.required` is enforced on save,
  // `isRequired` is only a marker
  const isEnforced = Boolean(field.validations?.required);
  const isRequired = isEnforced || Boolean(field.isRequired);

  const showRequiredReminder =
    isRequired && !isEnforced && !hasFieldValue(value);

  const formatLabel = formatValidationLabel(field);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        <FieldSaveStatus state={saveState} />
        {field.icon && !DEFAULT_ICONS.has(field.icon) && (
          <IconComponent
            name={field.icon}
            className="mr-1 inline size-3.5 align-[-2px]"
          />
        )}
        {field.name}
        {isRequired && <span className="text-destructive"> *</span>}
        {formatLabel && (
          <span className="ml-1 font-normal normal-case text-muted-foreground">
            ({formatLabel})
          </span>
        )}
      </Label>
      {showRequiredReminder && !error && (
        <span className="text-xs text-muted-foreground">
          Marked required — still empty
        </span>
      )}
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};

// Sits before the label so saving never shifts the field below it.
const FieldSaveStatus = ({ state }: { state: TFieldSaveState }) => {
  if (state === 'saving') {
    return (
      <span className="mr-1 inline-flex align-[-2px]" title="Saving…">
        <Spinner size="sm" containerClassName="w-auto" />
      </span>
    );
  }

  if (state === 'saved') {
    return (
      <span title="Saved">
        <IconCheck className="mr-1 inline size-3.5 align-[-2px] text-green-500" />
      </span>
    );
  }

  return null;
};
