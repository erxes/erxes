import type { TEmailsOnValueChange } from 'erxes-ui';
import { ValidationStatus, toast } from 'erxes-ui';
import { useCustomerEmailsContext } from 'ui-modules/modules/contacts/hooks/emails/useContactEmailsContext';
import { useEmailDoubleClick } from 'ui-modules/modules/contacts/hooks/emails/useEmailDoubleClick';
import { useComposeEmail } from 'ui-modules/modules/contacts/hooks/useComposeEmail';
import { useCustomerEdit } from 'ui-modules/modules/contacts/hooks/useEditCustomer';
import type { CustomerEmailsState } from 'ui-modules/modules/contacts/types/contactEmails';

export const useCustomerEmails = (): CustomerEmailsState => {
  const { primaryEmail, _id, emails, emailValidationStatus, onEmailClick } =
    useCustomerEmailsContext();
  const { customerEdit } = useCustomerEdit();
  const { canComposeEmail, composeEmail } = useComposeEmail();
  const activateEmail =
    onEmailClick ||
    (canComposeEmail
      ? (email: string) => composeEmail({ customerId: _id, email })
      : undefined);
  const {
    open,
    setOpen,
    handleEmailClick: handleVerifiedEmailClick,
    handleEmailDoubleClick: handleVerifiedEmailDoubleClick,
  } = useEmailDoubleClick(activateEmail);

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

  return {
    open,
    setOpen,
    activateEmail,
    emailProps,
    handleValueChange,
    handleValidationStatusChange,
    handleVerifiedEmailClick,
    handleVerifiedEmailDoubleClick,
  };
};
