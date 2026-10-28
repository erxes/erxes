import { createContext } from 'react';
import { ISelectStructureEntitiesContext } from '../types/StructureEntity';

export const SelectStructureEntitiesContext =
  createContext<ISelectStructureEntitiesContext | null>(null);
