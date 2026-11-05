import { cn, TextField } from 'erxes-ui';
import { useCPUserEdit } from '@/contacts/client-portal-users/hooks/useCPUserEdit';
import { PANEL_TEXT_FIELD_CLASS_NAME, usePermissionCheck } from 'ui-modules';

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
  const { hasActionPermission } = usePermissionCheck();

  const onSave = (newValue: string) => {
    cpUserEdit({
      variables: { _id, [field]: newValue || undefined },
    });
  };

  return hasActionPermission('clientPortalManage') ? (
    <TextField
      scope={`cp-user-panel.${_id}.${field}`}
      value={value}
      placeholder={placeholder}
      className={cn(
        PANEL_TEXT_FIELD_CLASS_NAME,
        !value && 'text-muted-foreground',
      )}
      onSave={onSave}
    />
  ) : (
    <span>{value || '-'}</span>
  );
}
