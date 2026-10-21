import { useContext } from 'react';
import { CompanyEmailsContext } from 'ui-modules/modules/contacts/contexts/emails/CompanyEmailsContext';
import { CustomerEmailsContext } from 'ui-modules/modules/contacts/contexts/emails/CustomerEmailsContext';
import type {
  CompanyEmailsProps,
  CustomerEmailsProps,
} from 'ui-modules/modules/contacts/types/contactEmails';

export const useCompanyEmailsContext = (): CompanyEmailsProps => {
  const value = useContext(CompanyEmailsContext);
  if (!value)
    throw new Error(
      'Company email content must be rendered within CompanyEmails',
    );
  return value;
};

export const useCustomerEmailsContext = (): CustomerEmailsProps => {
  const value = useContext(CustomerEmailsContext);
  if (!value)
    throw new Error(
      'Customer email content must be rendered within CustomerEmails',
    );
  return value;
};
