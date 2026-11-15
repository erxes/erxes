import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';

/** Controls of the enclosing `Filter`: open or close it and switch views. Throws outside one. */
export const useFilterContext = () => {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error('useFilterContext must be used inside <Filter>');
  }

  return context;
};
