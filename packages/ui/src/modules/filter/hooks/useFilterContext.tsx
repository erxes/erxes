import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';

export const useFilterContext = () => {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error('useFilterContext must be used inside <Filter>');
  }

  return context;
};
