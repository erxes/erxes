import { useContext } from 'react';
import { SelectStructureEntitiesContext } from '../contexts/SelectStructureEntitiesContext';

export const useSelectStructureEntitiesContext = () => {
  const context = useContext(SelectStructureEntitiesContext);

  if (!context) {
    throw new Error(
      'useSelectStructureEntitiesContext must be used within SelectStructureEntitiesProvider',
    );
  }

  return context;
};
