import { createContext } from 'react';
import { ISelectUnitContext } from '../types/Unit';

export const SelectUnitContext = createContext<ISelectUnitContext | null>(null);
