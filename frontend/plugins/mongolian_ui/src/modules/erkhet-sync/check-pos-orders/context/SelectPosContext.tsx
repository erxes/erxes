import { createContext, useContext } from 'react';
import { IPos } from '../types/pos';

export type ISelectPosContext = {
  posIds: string[];
  pos: IPos[];
  setPos: (pos: IPos[]) => void;
  onSelect: (pos: IPos) => void;
  loading: boolean;
  error: string | null;
};

export const SelectPosContext = createContext<ISelectPosContext | null>(
  null,
);

export const useSelectPosContext = () => {
  const context = useContext(SelectPosContext);
  if (!context) {
    throw new Error(
      'useSelectPosContext must be used within a SelectPosProvider',
    );
  }
  return context;
};
