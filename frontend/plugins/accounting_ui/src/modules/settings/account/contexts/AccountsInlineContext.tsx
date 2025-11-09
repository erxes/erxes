import { createContext, useContext } from 'react';
import { IAccount } from '../types/Account';

export interface IAccountsInlineContext {
  accounts: IAccount[];
  loading: boolean;
  accountIds?: string[];
  placeholder: string;
  updateAccounts?: (accounts: IAccount[]) => void;
  allowUnassigned?: boolean;
}

export const AccountsInlineContext =
  createContext<IAccountsInlineContext | null>(null);

export const useAccountsInlineContext = () => {
  const context = useContext(AccountsInlineContext);
  if (!context) {
    throw new Error(
      'useAccountsInlineContext must be used within an AccountsInlineProvider',
    );
  }
  return context;
};
