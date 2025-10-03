import {
  EmailDisplay,
  EmailListField,
  PopoverScoped,
  RecordTableInlineCell,
  TEmailsOnValueChange,
  ValidationStatus,
} from 'erxes-ui';
import { useCustomerEdit } from 'ui-modules/modules/contacts/hooks';

interface CustomerEmailsProps {
  primaryEmail: string;
  _id: string;
  emailValidationStatus?: `${ValidationStatus}`;
  emails: string[];
  scope?: string;
  Trigger: React.ComponentType<{ children: React.ReactNode }>;
}

export function CustomerEmails({
  primaryEmail,
  _id,
  emailValidationStatus,
  emails,
  scope,
  Trigger,
}: CustomerEmailsProps) {
  const { customerEdit } = useCustomerEdit();

  const emailProps = {
    primaryEmail,
    emails,
    emailValidationStatus: emailValidationStatus as ValidationStatus,
  };

  const handleValidationStatusChange = (status: ValidationStatus) => {
    customerEdit({
      variables: {
        _id,
        emailValidationStatus: status,
      },
    });
  };

  const handleValueChange: TEmailsOnValueChange = (values) => {
    customerEdit({
      variables: {
        _id,
        ...values,
      },
    });
  };

  return (
    <PopoverScoped scope={scope || ''} modal>
      <Trigger>
        <EmailDisplay {...emailProps} />
      </Trigger>
      <RecordTableInlineCell.Content className="w-72">
        <EmailListField
          recordId={_id}
          {...emailProps}
          onValueChange={handleValueChange}
          onValidationStatusChange={handleValidationStatusChange}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
}
