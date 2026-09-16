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
import { useEmailDoubleClick } from './useEmailDoubleClick';

interface CustomerEmailsProps {
  primaryEmail: string;
  _id: string;
  emailValidationStatus?: `${ValidationStatus}`;
  emails: string[];
  scope?: string;
  Trigger: React.ComponentType<{ children: React.ReactNode }>;
  onEmailClick?: (email: string) => void;
}

export function CustomerEmails({
  primaryEmail,
  _id,
  emailValidationStatus,
  emails,
  scope,
  Trigger,
  onEmailClick,
}: CustomerEmailsProps) {
  const { customerEdit } = useCustomerEdit();
  const {
    open,
    setOpen,
    handleEmailClick: handleVerifiedEmailClick,
  } = useEmailDoubleClick(onEmailClick);

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
    <PopoverScoped scope={scope || ''} modal open={open} onOpenChange={setOpen}>
      <Trigger>
        <EmailDisplay {...emailProps} onEmailClick={handleVerifiedEmailClick} />
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
