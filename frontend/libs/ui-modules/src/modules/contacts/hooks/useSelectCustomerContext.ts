import { SelectCustomerContext } from '../contexts/SelectCustomerContext';
import { useContext } from 'react';

export const useSelectCustomerContext = () => {
  const context = useContext(SelectCustomerContext);
  if (!context) {
    throw new Error(
      'useSelectCustomerContext must be used within a SelectCustomerProvider',
    );
  }
  return context;
};
