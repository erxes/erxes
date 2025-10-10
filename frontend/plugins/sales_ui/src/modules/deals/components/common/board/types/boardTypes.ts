import type {
  DndContextProps,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { HTMLAttributes } from 'react';

export type BoardItemProps = {
  id: string;
  column: string;
  sort?: unknown;
} & Record<string, unknown>;

export type BoardColumnProps = {
  id: string;
  name: string;
} & Record<string, unknown>;

export type BoardHeaderProps = HTMLAttributes<HTMLDivElement>;

export type BoardContextProps<
  T extends BoardItemProps = BoardItemProps,
  C extends BoardColumnProps = BoardColumnProps,
> = {
  columns: C[];
  data: T[];
  boardId: string | null;
};

export type BoardProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

export type BoardProviderProps<
  T extends BoardItemProps = BoardItemProps,
  C extends BoardColumnProps = BoardColumnProps,
> = Omit<DndContextProps, 'children'> & {
  children: (column: C) => React.ReactNode;
  className?: string;
  columns: C[];
  data: T[];
  onDataChange?: (data: T[]) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  boardId: string;
};

export type BoardCardProps<T extends BoardItemProps = BoardItemProps> = T & {
  children?: React.ReactNode;
  className?: string;
};
