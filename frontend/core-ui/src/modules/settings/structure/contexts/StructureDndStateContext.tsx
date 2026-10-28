import { createContext, useContext } from 'react';
import { TStructureDragItem } from '../utils/structureDrop';

export type TStructureDndState = {
  activeItem: TStructureDragItem | null;
  copy: boolean;
};

export const StructureDndStateContext = createContext<TStructureDndState>({
  activeItem: null,
  copy: false,
});

export const useStructureDndState = () => useContext(StructureDndStateContext);
