import { createContext, useContext } from 'react';
import { ICompany } from '../types';

export type ISelectCompanyContext = {
  companyIds: string[];
  onSelect: (company: ICompany) => void;
  companies: ICompany[];
  setCompanies: (companies: ICompany[]) => void;
  loading: boolean;
  error: string | null;
};

export const SelectCompanyContext =
  createContext<ISelectCompanyContext | null>(null);


export const useSelectCompanyContext = () => {
  const context = useContext(SelectCompanyContext);
  if (!context) {
    throw new Error('useSelectCompanyContext must be used within a SelectCompanyContext.Provider');
  }
  return context;
};