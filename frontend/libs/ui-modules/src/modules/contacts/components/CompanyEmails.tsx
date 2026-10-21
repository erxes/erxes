import { CompanyEmailsContent } from 'ui-modules/modules/contacts/components/emails/CompanyEmailsContent';
import { CompanyEmailsContext } from 'ui-modules/modules/contacts/contexts/emails/CompanyEmailsContext';
import type { CompanyEmailsProps } from 'ui-modules/modules/contacts/types/contactEmails';

export const CompanyEmails = (value: CompanyEmailsProps) => (
  <CompanyEmailsContext.Provider value={value}>
    <CompanyEmailsContent />
  </CompanyEmailsContext.Provider>
);
