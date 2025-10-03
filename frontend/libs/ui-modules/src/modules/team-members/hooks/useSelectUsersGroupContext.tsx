import { useContext } from 'react';
import { SelectUsersGroupContext } from '../contexts/SelectUsersGroupContext';

export const useSelectUsersGroupContext = () => {
  const context = useContext(SelectUsersGroupContext);
  if (!context) {
    throw new Error(
      'useSelectUsersGroupContext must be used within a SelectUsersGroupContext',
    );
  }
  return context;
};
