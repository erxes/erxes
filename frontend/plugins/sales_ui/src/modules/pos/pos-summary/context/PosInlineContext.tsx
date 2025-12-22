import { createContext, useContext } from 'react';
import { PosInlineProps } from '../types/pos';

export type IPosInlineContext = PosInlineProps & {
  loading: boolean;
};

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
