import type { SalesBoardsQuery } from '~/gql/graphql';
import type { IDeal } from './deals';
import type { IStage } from './stages';

import { BOARD_CREATE_SCHEMA } from '@/deals/schemas/boardFormSchema';

import { z } from 'zod';

export type IBoard = NonNullable<
  NonNullable<SalesBoardsQuery['salesBoards']>[number]
>;

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
  onFetchComplete?: (
    columnId: string,
    result: {
      fetchedCount: number;
      hasMore: boolean;
      cursor?: string | null;
      totalCount?: number;
    },
  ) => void;
  locallyMovedIdsRef?: React.MutableRefObject<Record<string, string>>;
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
    draggedItemId?: string,
  ) => void;
  onDragStart?: (itemId: string) => void;
  renderCard: (item: TItem, isDragOverlay?: boolean) => React.ReactNode;
  renderColumnHeader?: (column: TColumn, itemCount: number) => React.ReactNode;
  columnClassName?: string;
  cardClassName?: string;
  columnPagination?: Record<string, ColumnPaginationState>;
  onLoadMore?: (columnId: string) => void;
}
export type BoardDealColumn = Pick<
  IStage,
  '_id' | 'name' | 'type' | 'probability' | 'itemsTotalCount'
> & { amount: Record<string, number>; unUsedAmount: Record<string, number> };

export type ActiveDragItem =
  | { type: 'column'; column: BoardDealColumn }
  | { type: 'card'; item: IDeal & BaseBoardItem }
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

export type TBoardForm = z.infer<typeof BOARD_CREATE_SCHEMA>;
