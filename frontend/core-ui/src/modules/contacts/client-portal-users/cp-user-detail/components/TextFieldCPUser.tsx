import { TextField } from 'erxes-ui';
import { useCPUserEdit } from '@/contacts/client-portal-users/hooks/useCPUserEdit';

type EditableField =
  | 'email'
  | 'phone'
  | 'firstName'
  | 'lastName'
  | 'username'
  | 'companyName'
  | 'companyRegistrationNumber';

interface TextFieldCPUserProps {
  field: EditableField;
  _id: string;
  value: string;
  placeholder?: string;
}

export function TextFieldCPUser({
  field,
  _id,
  value,
  placeholder,
}: TextFieldCPUserProps) {
  const { cpUserEdit } = useCPUserEdit();

  const onSave = (newValue: string) => {
    cpUserEdit({
      variables: { _id, [field]: newValue || undefined },
    });
  };

  return <TextField value={value} placeholder={placeholder} onSave={onSave} />;
}
