import { createContext, ReactNode, useContext } from 'react';

/**
 * Which credentials the sender UI is looking at. Campaigns can run on their own
 * provider account, so the same components render a different sender list
 * depending on where they appear.
 */
export type TEmailScope = 'transactional' | 'broadcast';

const EmailSenderScopeContext = createContext<TEmailScope>('transactional');

export const EmailSenderScopeProvider = ({
  scope,
  children,
}: {
  scope: TEmailScope;
  children: ReactNode;
}) => (
  <EmailSenderScopeContext.Provider value={scope}>
    {children}
  </EmailSenderScopeContext.Provider>
);

export const useEmailSenderScope = () => useContext(EmailSenderScopeContext);
