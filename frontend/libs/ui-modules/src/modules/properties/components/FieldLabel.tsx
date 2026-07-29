import { Label } from 'erxes-ui';
import { IField } from '../types/fieldsTypes';
import { hasFieldValue } from '../propertyUtils';

export const FieldLabel = ({
  field,
  children,
  id,
  inCell,
  value,
}: {
  field: IField;
  children: React.ReactNode;
  id: string;
  inCell?: boolean;
  value?: unknown;
}) => {
  if (inCell) {
    return children;
  }

  const showRequiredWarning = Boolean(field.isRequired) && !hasFieldValue(value);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {field.name}
        {field.isRequired && <span className="text-destructive"> *</span>}
      </Label>
      {showRequiredWarning && (
        <span className="text-xs text-destructive">This field is required</span>
      )}
      {children}
    </div>
  );
};
