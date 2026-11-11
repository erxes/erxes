import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';

export const useFilterContext = () => {
  return useContext(FilterContext);
};
