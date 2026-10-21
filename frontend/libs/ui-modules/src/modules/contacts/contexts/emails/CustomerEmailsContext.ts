import { createContext } from 'react';
import type { CustomerEmailsProps } from 'ui-modules/modules/contacts/types/contactEmails';

export const CustomerEmailsContext = createContext<CustomerEmailsProps | null>(
  null,
);
