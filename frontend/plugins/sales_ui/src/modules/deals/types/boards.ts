import { MutationHookOptions, OperationVariables } from "@apollo/client";

import { BOARD_CREATE_SCHEMA } from "@/deals/schemas/boardFormSchema";
import { IPipeline } from "@/deals/types/pipelines";
import { z } from "zod";

export interface IBoard {
    _id: string;
    name: string;
    pipelines?: IPipeline[];
  }
  
export interface IBoardCount {
    _id: string;
    name: string;
    count: number;
}     

export interface ISelectBoardsProviderProps {
  targetIds?: string[];
  value?: string[] | string;
  onValueChange?: (boards?: string[] | string) => void;
  mode?: 'single' | 'multiple';
  children?: React.ReactNode;
  options?: (newSelectedBoardIds: string[]) => MutationHookOptions<
    {
      BoardsMain: {
        totalCount: number;
        list: IBoard[];
      };
    },
    OperationVariables
  >;
}

export interface ISelectBoardsContext {
  boardIds: string[];
  boards: IBoard[];
  setBoards: (boards: IBoard[]) => void;
  onSelect: (board: IBoard) => void;
  loading: boolean;
  error: string | null;
  newBoardName?: string;
  setNewBoardName?: (name: string) => void;
}

export interface BoardsInlineProps {
  boardIds?: string[];
  boards?: IBoard[];
  placeholder?: string;
  updateBoards?: (boards: IBoard[]) => void;
}

export type TBoardForm = z.infer<typeof BOARD_CREATE_SCHEMA>;
