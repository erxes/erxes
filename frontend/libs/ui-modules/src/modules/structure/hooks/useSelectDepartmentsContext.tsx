import { useContext } from 'react';
import { SelectDepartmentsContext } from '../contexts/SelectDepartmentsContext';
import { ISelectDepartmentsContext } from '../types/Department';

export const useSelectDepartmentsContext = () => {
  const context = useContext(SelectDepartmentsContext);
  if (!context) {
    throw new Error(
      'useSelectDepartmentsContext must be used within <SelectDepartmentsProvider>',
    );
  }
  return context || ({} as ISelectDepartmentsContext);
};
