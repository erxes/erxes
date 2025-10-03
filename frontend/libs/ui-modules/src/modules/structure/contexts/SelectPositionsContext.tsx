import { createContext } from 'react';
import { ISelectPositionsContext } from '../types/Position';

export const SelectPositionsContext =
  createContext<ISelectPositionsContext | null>(null);
