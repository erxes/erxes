import {
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import type {
  DndContextProps,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { IStage } from '@/deals/types/stages';
import { IDeal } from '@/deals/types/deals';

export type KanbanContextProps<
  T extends IDeal = IDeal,
  C extends IStage = IStage,
> = {
  columns: C[];
  data: T[];
  activeCardId: string | null;
  onDataChange?: any;
};

export type KanbanBoardProps = {
  _id: string;
  children: ReactNode;
  className?: string;
  onColumnsChange?: (newColumns: any[]) => void;
};

export type KanbanCardProps = {
  children?: ReactNode;
  className?: string;
  loading?: boolean;
  featureId: string;
  card: IDeal;
};

export type KanbanCardsProps<T extends IDeal = IDeal> =
  Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> & {
    children: (item: IDeal) => ReactNode;
    id: string;
  };

  export type KanbanHeaderProps = HTMLAttributes<HTMLDivElement>;

  export type KanbanProviderProps<
    T extends IDeal = IDeal,
    C extends IStage = IStage,
  > = Omit<DndContextProps, 'children'> & {
    children: (column: C) => ReactNode;
    className?: string;
    columns: C[];
    data: T[];
    onDataChange?: (data: T[]) => void;
    onColumnsChange?: (newColumns: any[]) => void;
    onDragStart?: (event: DragStartEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    onDragOver?: (event: DragOverEvent) => void;
    updateOrders?: (variables: { itemId?: string; destinationStageId?: string; orders?: Array<{ _id: string; order: number }> }, type: 'card' | 'column') => void;
  };
