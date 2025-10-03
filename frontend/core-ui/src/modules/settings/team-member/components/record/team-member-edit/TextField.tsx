import { TextField } from 'erxes-ui';
import { useUserEdit } from '../../../hooks/useUserEdit';

interface TextFieldProps {
  placeholder?: string;
  value: string;
  field: string;
  fieldId?: string;
  _id: string;
  className?: string;
}

export const TextFieldUser = ({
  placeholder,
  value,
  field,
  fieldId,
  _id,
  className,
}: TextFieldProps) => {
  const { usersEdit } = useUserEdit();
  const onSave = (editingValue: string | number) => {
    if (editingValue === value) return;
    usersEdit(
      {
        variables: { _id, [field]: editingValue },
      },
      [field],
    );
  };
  return (
    <TextField
      placeholder={placeholder}
      value={value}
      field={field}
      fieldId={fieldId}
      _id={_id}
      onSave={onSave}
      className={className}
    />
  );
};
