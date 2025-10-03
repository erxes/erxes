import { createContext, useContext } from 'react';
import { ICompany } from '../types';

interface CompaniesInlineContextType {
  companies: ICompany[];
  loading: boolean;
  placeholder?: string;
  updateCompanies?: (companies: ICompany[]) => void;
  companyIds?: string[];
}

export const CompaniesInlineContext = createContext<CompaniesInlineContextType | null>(
  null
);

export const useCompaniesInlineContext = () => {
  const context = useContext(CompaniesInlineContext);
  if (context === null) {
    throw new Error(
      'useCompaniesInlineContext must be used within a CompaniesInlineProvider',
    );
  }
  return context;
};
