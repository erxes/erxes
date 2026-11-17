import { createContext, type ReactNode, use } from 'react';

/** A card's column and how its dragged copy looks, kept while it is on the board. */
export type BoardCardEntry = { columnId: string; title: string; preview: ReactNode };

/** Where the card being dragged would land: its new column, above `beforeId` or last. */
export type BoardTarget = { columnId: string; beforeId: string | null };

/** The cards on the board, and whether the last drop moved one. */
export class BoardCards {
  #cards = new Map<string, BoardCardEntry>();
  #columns = new Map<string, string>();
  #moved = false;

  get = (id: string) => this.#cards.get(id);

  columnOf = (id: string) => this.#cards.get(id)?.columnId;

  /** A card's or a column's title, for screen readers. */
  titleOf = (id: string) => this.#cards.get(id)?.title ?? this.#columns.get(id) ?? id;

  moved = () => this.#moved;

  drop = (moved: boolean) => {
    this.#moved = moved;
  };

  /** Keeps the column's title until it leaves the board. */
  addColumn = (id: string, title: string) => {
    this.#columns.set(id, title);

    return () => {
      if (this.#columns.get(id) === title) this.#columns.delete(id);
    };
  };

  /** Keeps the card's entry until it leaves the board. */
  add = (id: string, entry: BoardCardEntry) => {
    this.#cards.set(id, entry);

    return () => {
      if (this.#cards.get(id) === entry) this.#cards.delete(id);
    };
  };
}

export type BoardContextValue = {
  ordered: boolean;
  target: BoardTarget | null;
  cards: BoardCards;
};

export const BoardContext = createContext<BoardContextValue | null>(null);

export const BoardColumnContext = createContext<string | null>(null);

export const useBoard = () => {
  const board = use(BoardContext);

  if (!board) throw new Error('Board.Column and Board.Card go inside Board');

  return board;
};

export const useBoardColumnId = () => {
  const columnId = use(BoardColumnContext);

  if (columnId === null) throw new Error('Board.Card goes inside Board.Column');

  return columnId;
};
