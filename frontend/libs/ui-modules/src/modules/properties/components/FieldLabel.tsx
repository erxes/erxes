import { Label } from 'erxes-ui';
import { IField } from '../types/fieldsTypes';
import { formatValidationLabel, hasFieldValue } from '../propertyUtils';

export const FieldLabel = ({
  field,
  children,
  id,
  inCell,
  value,
  error,
}: {
  field: IField;
  children: React.ReactNode;
  id: string;
  inCell?: boolean;
  value?: unknown;
  error?: string | null;
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
