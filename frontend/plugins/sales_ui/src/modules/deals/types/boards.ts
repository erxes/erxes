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

export interface BaseBoardItem {
  id: string;
  columnId: string;
}

export interface BaseBoardColumn {
  _id: string;
  name: string;
}

export interface GenericBoardState<
  TItem extends BaseBoardItem,
  TColumn extends BaseBoardColumn,
> {
  columns: TColumn[];
  items: Record<string, TItem>;
  columnItems: Record<string, string[]>;
}

export interface GenericBoardProps<
  TItem extends BaseBoardItem,
  TColumn extends BaseBoardColumn,
> {
  initialState: GenericBoardState<TItem, TColumn>;
  onStateChange?: (
    newState: GenericBoardState<TItem, TColumn>, 
    oldState: GenericBoardState<TItem, TColumn>,
    draggedItemId?: string
  ) => void;
  onDragStart?: (itemId: string) => void;
  renderCard: (item: TItem, isDragOverlay?: boolean) => React.ReactNode;
  renderColumnHeader?: (column: TColumn, itemCount: number) => React.ReactNode;
  columnClassName?: string;
  cardClassName?: string;
}
export interface BoardDealColumn extends BaseBoardColumn {
  type: string;
  probability?: string;
  itemsTotalCount?: number;
  amount?: number | string | null;
  unUsedAmount?: number;
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

export type ActiveDragItem = 
  | { type: 'column'; column: BoardDealColumn }
  | { type: 'card'; item: any }
  | null;

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
