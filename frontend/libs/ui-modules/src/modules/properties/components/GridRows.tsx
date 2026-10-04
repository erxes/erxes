import { cn } from 'erxes-ui';
import { ReactNode } from 'react';

// Spelled out so Tailwind keeps the classes.
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export interface IGridRow<T> {
  items: T[];
  columns: number;
}

export const GridRows = <T,>({
  rows,
  getKey,
  render,
}: {
  rows: IGridRow<T>[];
  getKey: (item: T) => string;
  render: (item: T) => ReactNode;
}) => (
  <div className="flex flex-col gap-4">
    {rows.map((row) => (
      <div
        key={getKey(row.items[0])}
        className={cn('grid gap-4', GRID_COLS[row.columns])}
      >
        {row.items.map(render)}
      </div>
    ))}
  </div>
);
