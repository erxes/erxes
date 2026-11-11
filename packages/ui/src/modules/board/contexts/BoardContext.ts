import { BoardContextProps } from '../types/boardTypes';
import { createContext } from 'react';

export const BoardContext = createContext<BoardContextProps>({
  columns: [],
  data: [],
  boardId: null,
});
