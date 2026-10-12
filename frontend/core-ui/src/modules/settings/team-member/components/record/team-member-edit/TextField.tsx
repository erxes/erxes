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
  _id,
  className,
}: TextFieldProps) => {
  const { usersEdit } = useUserEdit();
  const onSave = (editingValue: string | number) => {
    if (editingValue === value) return;
    usersEdit({
      variables: { _id, [field]: editingValue },
    });
  };
  return (
    <TextField
      placeholder={placeholder}
      value={value}
      scope={`user-${_id}-${field}`}
      onSave={onSave}
      className={className}
    />
  );
};
