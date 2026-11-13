import { createContext, useContext } from 'react';

// Lets the contact detail views show a record other than the one named in the
// URL (`contactId` / `companyId`), e.g. inside the side panel.
const ContactDetailIdContext = createContext<string | null>(null);

export const ContactDetailIdProvider = ContactDetailIdContext.Provider;

export const useContactDetailId = () => useContext(ContactDetailIdContext);
