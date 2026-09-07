import {
  EmailDisplay,
  EmailListField,
  PopoverScoped,
  RecordTableInlineCell,
  TEmailsOnValueChange,
  ValidationStatus,
  toast,
} from 'erxes-ui';
import { useCustomerEdit } from 'ui-modules/modules/contacts/hooks';

interface CustomerEmailsProps {
  primaryEmail: string;
  _id: string;
  emailValidationStatus?: `${ValidationStatus}`;
  emails: string[];
  scope?: string;
  Trigger: React.ComponentType<{ children: React.ReactNode }>;
  onEmailDoubleClick?: (email: string) => void;
}

export function CustomerEmails({
  primaryEmail,
  _id,
  emailValidationStatus,
  emails,
  scope,
  Trigger,
  onEmailDoubleClick,
}: CustomerEmailsProps) {
  const { customerEdit } = useCustomerEdit();

  const emailProps = {
    primaryEmail,
    emails,
    emailValidationStatus: emailValidationStatus as ValidationStatus,
  };

  const handleValueChange: TEmailsOnValueChange = (values) => {
    customerEdit({
      variables: {
        _id,
        ...values,
      },
    });
  };

  const handleValidationStatusChange = (status: ValidationStatus) => {
    customerEdit({
      variables: {
        _id,
        emailValidationStatus: status,
      },
      onCompleted: () =>
        toast({
          title:
            status === ValidationStatus.Valid
              ? 'Email verified'
              : 'Email unverified',
          variant: 'success',
        }),
    });
  };

  return (
    <PopoverScoped scope={scope || ''} modal>
      <Trigger>
        <EmailDisplay {...emailProps} onEmailDoubleClick={onEmailDoubleClick} />
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
