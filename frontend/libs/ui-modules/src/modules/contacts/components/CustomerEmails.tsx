import { CustomerEmailsContent } from 'ui-modules/modules/contacts/components/emails/CustomerEmailsContent';
import { CustomerEmailsContext } from 'ui-modules/modules/contacts/contexts/emails/CustomerEmailsContext';
import type { CustomerEmailsProps } from 'ui-modules/modules/contacts/types/contactEmails';

export const CustomerEmails = (value: CustomerEmailsProps) => (
  <CustomerEmailsContext.Provider value={value}>
    <CustomerEmailsContent />
  </CustomerEmailsContext.Provider>
);
