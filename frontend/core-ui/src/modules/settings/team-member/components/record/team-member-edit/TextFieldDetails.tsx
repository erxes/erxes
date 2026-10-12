import { TextField } from 'erxes-ui';
import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { IUserDetailsType } from '@/settings/team-member/types';

interface TextFieldProps {
  placeholder?: string;
  value: string;
  field: keyof IUserDetailsType;
  _id: string;
  className?: string;
}

export const TextFieldUserDetails = ({
  placeholder,
  value,
  field,
  _id,
  className,
}: TextFieldProps) => {
  const { usersEdit } = useUserEdit();
  const onSave = (editingValue: string) => {
    if (editingValue === value) return;
    usersEdit({
      variables: { _id, details: { [field]: editingValue } },
    });
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
