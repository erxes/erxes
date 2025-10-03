import { createContext } from 'react';
import { ISelectDepartmentsContext } from '../types/Department';

export const SelectDepartmentsContext =
  createContext<ISelectDepartmentsContext | null>(null);
