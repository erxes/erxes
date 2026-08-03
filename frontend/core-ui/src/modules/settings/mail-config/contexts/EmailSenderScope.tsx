import { createContext, ReactNode, useContext } from 'react';

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
