import type { TEmailsOnValueChange } from 'erxes-ui';
import { ValidationStatus } from 'erxes-ui';
import { useCompanyEmailsContext } from 'ui-modules/modules/contacts/hooks/emails/useContactEmailsContext';
import { useEmailDoubleClick } from 'ui-modules/modules/contacts/hooks/emails/useEmailDoubleClick';
import { useComposeEmail } from 'ui-modules/modules/contacts/hooks/useComposeEmail';
import { useCompaniesEdit } from 'ui-modules/modules/contacts/hooks/useEditCompany';
import type { ContactEmailsState } from 'ui-modules/modules/contacts/types/contactEmails';

export const useCompanyEmails = (): ContactEmailsState => {
  const { primaryEmail, _id, emails, emailValidationStatus, onEmailClick } =
    useCompanyEmailsContext();
  const { companiesEdit } = useCompaniesEdit();
  const { canComposeEmail, composeEmail } = useComposeEmail();
  const activateEmail =
    onEmailClick ||
    (canComposeEmail
      ? (email: string) => composeEmail({ companyId: _id, email })
      : undefined);
  const { open, setOpen, handleEmailClick, handleEmailDoubleClick } =
    useEmailDoubleClick(activateEmail);
  const emailProps = {
    primaryEmail,
    emails,
    emailValidationStatus: emailValidationStatus || ValidationStatus.Invalid,
  };

  const handleValidationStatusChange = (status: ValidationStatus) => {
    companiesEdit({
      variables: {
        _id,
        emailValidationStatus: status,
      },
    });
  };

  const handleValueChange: TEmailsOnValueChange = (values) => {
    companiesEdit({
      variables: {
        _id,
        ...values,
      },
    });
  };

  return {
    open,
    setOpen,
    activateEmail,
    emailProps,
    handleValueChange,
    handleValidationStatusChange,
    handleEmailClick,
    handleEmailDoubleClick,
  };
};
