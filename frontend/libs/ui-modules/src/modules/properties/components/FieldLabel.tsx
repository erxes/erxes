import { Label } from 'erxes-ui';
import { IField } from '../types/fieldsTypes';

export const FieldLabel = ({
  field,
  children,
  id,
  inCell,
}: {
  field: IField;
  children: React.ReactNode;
  id: string;
  inCell?: boolean;
}) => {
  if (inCell) {
    return children;
  }
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{field.name}</Label>
      {children}
    </div>
  );
};
