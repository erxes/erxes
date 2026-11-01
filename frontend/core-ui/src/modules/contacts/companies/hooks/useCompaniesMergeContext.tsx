import { useContext } from 'react';
import { CompaniesMergeContext } from '@/contacts/companies/context/CompaniesMergeContext';

export const useCompaniesMergeContext = () => {
  const context = useContext(CompaniesMergeContext);

  if (!context) {
    throw new Error(
      'useCompaniesMergeContext must be used within CompaniesMergeProvider',
    );
  }

  return context;
};
