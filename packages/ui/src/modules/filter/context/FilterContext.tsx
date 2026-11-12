import { createContext } from 'react';
import type { IFilterContext } from '../types/filter';

export const FilterContext = createContext<IFilterContext>({} as IFilterContext);
