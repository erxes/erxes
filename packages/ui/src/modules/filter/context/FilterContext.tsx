import { createContext } from 'react';
import { IFilterContext } from '../types/filter';

export const FilterContext = createContext<IFilterContext>(
  {} as IFilterContext,
);
