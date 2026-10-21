import { createContext } from 'react';
import type { CompanyEmailsProps } from 'ui-modules/modules/contacts/types/contactEmails';

export const CompanyEmailsContext = createContext<CompanyEmailsProps | null>(
  null,
);
