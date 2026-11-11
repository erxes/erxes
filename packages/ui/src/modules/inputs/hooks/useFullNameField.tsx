import { FullNameFieldContext } from 'erxes-ui/modules/inputs/contexts/FullNameFieldContext';
import { useContext } from 'react';

export const useFullNameField = () => {
  const context = useContext(FullNameFieldContext);
  if (!context) {
    throw new Error(
      'useFullNameField must be used within a FullNameFieldProvider',
    );
  }
  return context;
};
