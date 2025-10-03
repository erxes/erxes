import { createContext, useContext } from 'react';

import { IBoard } from '@/deals/types/boards';

export interface IBoardsInlineContext {
  boards: IBoard[];
  loading: boolean;
  boardIds?: string[];
  placeholder: string;
  updateBoards?: (boards: IBoard[]) => void;
}

export const BoardsInlineContext = createContext<IBoardsInlineContext | null>(
  null,
);

export const useBoardsInlineContext = () => {
  const context = useContext(BoardsInlineContext);
  if (!context) {
    throw new Error(
      'useBoardsInlineContext must be used within a BoardsInlineProvider',
    );
  }
  return context;
};
