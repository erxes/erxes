import { createContext, useContext } from 'react';
import { IAccount } from '../types/Account';

export type ISelectAccountContext = {
  accountIds: string[];
  onSelect: (account?: IAccount) => void;
  accounts: IAccount[];
  setAccounts: (accounts: IAccount[]) => void;
  defaultFilter?: { [key: string]: string | boolean | string[] };
  onCallback?: (account: IAccount) => void;
  loading?: boolean;
  error?: string;
};

export const SelectAccountContext = createContext<ISelectAccountContext | null>(
  null,
);

export const useSelectAccountContext = () => {
  const context = useContext(SelectAccountContext);
  if (!context) {
    throw new Error(
      'useSelectAccountContext must be used within a SelectAccountProvider',
    );
  }
  return context;
};
