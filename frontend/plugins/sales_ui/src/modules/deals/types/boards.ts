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
  _id: string;
  columnId: string;
}

export interface BaseBoardColumn {
  _id: string;
  name: string;
}

export interface ColumnPaginationState {
  hasMore: boolean;
  isLoading: boolean;
  totalCount?: number;
}

export interface GenericBoardColumnProps<
  TItem extends BaseBoardItem,
  TColumn extends BaseBoardColumn,
> {
  column: TColumn;
  items: TItem[];
  renderCard: (item: TItem, isDragOverlay?: boolean) => React.ReactNode;
  renderColumnHeader?: (column: TColumn, itemCount: number) => React.ReactNode;
  className?: string;
  cardClassName?: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
}

export interface DealsBoardColumnProps {
  column: BoardDealColumn;
  count: number;
  pipelineId: string;
  queryVariables?: Record<string, unknown>;
  fetchMoreTrigger?: number;
  onFetchComplete?: (columnId: string, result: {
    fetchedCount: number;
    hasMore: boolean;
    cursor?: string | null;
    totalCount?: number;
  }) => void;
  locallyMovedIdsRef?: any;
}

export interface VirtualizedCardListProps<TItem extends BaseBoardItem> {
  columnId: string;
  items: TItem[];
  renderCard: (item: TItem, isDragOverlay?: boolean) => React.ReactNode;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
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
  columnPagination?: Record<string, ColumnPaginationState>;
  onLoadMore?: (columnId: string) => void;
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
