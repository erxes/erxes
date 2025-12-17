import { createContext, useContext } from 'react';
import { IPos } from '../types/pos';

export interface IPosInlineContext {
  pos: IPos[];
  loading: boolean;
  posIds?: string[];
  placeholder: string;
  updatePos?: (pos: IPos[]) => void;
}

export const PosInlineContext = createContext<IPosInlineContext | null>(null);

export const usePosInlineContext = () => {
  const context = useContext(PosInlineContext);
  if (!context) {
    throw new Error(
      'usePosInlineContext must be used within a PosInlineProvider',
    );
  }
  return context;
};
