import type { DataModel } from './types';

export const OVERVIEW_COLUMN_WIDTH = 336;
export const OVERVIEW_COLUMNS = 3;
const OVERVIEW_STAGGER = 48;

export const overviewRowHeight = (heights: number[]): number =>
  Math.ceil(Math.max(336, ...heights.map((height) => height + 64)) / 24) * 24;

export const overviewGridLayout = (
  models: DataModel[],
  rowHeight: number,
): Record<string, { x: number; y: number }> =>
  Object.fromEntries(
    models.map((model, index) => {
      const column = index % OVERVIEW_COLUMNS;
      return [
        model._id,
        {
          x: column * OVERVIEW_COLUMN_WIDTH,
          y:
            Math.floor(index / OVERVIEW_COLUMNS) * rowHeight +
            (column === 1 ? OVERVIEW_STAGGER : 0),
        },
      ];
    }),
  );
