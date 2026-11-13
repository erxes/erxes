import { cn, TextField } from 'erxes-ui';
import { type Icon } from '@tabler/icons-react';
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
  icon: Icon;
}

export function TextFieldCPUser({
  field,
  _id,
  value,
  placeholder,
  icon: Icon,
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
    >
      {!value && (
        <Icon
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </TextField>
  ) : (
    <span className="flex h-7 items-center gap-1.5 px-2">
      {value || (
        <>
          <Icon
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="text-muted-foreground">{placeholder}</span>
        </>
      )}
    </span>
  );
}
