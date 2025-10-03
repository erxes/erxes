import { TextField } from 'erxes-ui';
import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';

interface TextFieldProps {
  placeholder?: string;
  value: string;
  field: string;
  fieldId?: string;
  _id: string;
  className?: string;
}

export const FirstNameField = ({
  placeholder,
  value,
  field,
  _id,
  className,
}: TextFieldProps) => {
  const { usersEdit } = useUserEdit();
  const onSave = (editingValue: string) => {
    if (editingValue === value) return;
    usersEdit(
      {
        variables: { _id, details: { [field]: editingValue } },
      },
      [field],
    );
  };
  return (
    <TextField
      placeholder={placeholder}
      value={value}
      scope={`user-${_id}-details-${field}`}
      onSave={onSave}
      className={className}
    />
  );
};
