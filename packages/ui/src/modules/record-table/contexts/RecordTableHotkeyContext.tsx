import React, { createContext, useContext, useState } from 'react';
import { useScopedHotkeys } from 'erxes-ui/modules/hotkey/hooks/useScopedHotkeys';

/** [row, column] of the active cell; column -1 means no cell is active yet. */
type Cell = [number, number];

type ArrowKey = 'ArrowRight' | 'ArrowLeft' | 'ArrowUp' | 'ArrowDown';

interface IRecordTableHotkeyContext {
  activeRow: string | null;
  activeCell: Cell;
  setActiveRow: (rowId: string | null) => void;
  setActiveCell: (cell: Cell) => void;
  scope: string;
}

const RecordTableHotkeyContext = createContext<IRecordTableHotkeyContext | null>(null);

/** The cell an arrow key moves to; left and right wrap to the previous or next row. */
const nextCell = (
  [row, column]: Cell,
  key: ArrowKey,
  rowLength: number,
  columnLength: number,
): Cell => {
  const lastRow = rowLength - 1;
  const lastColumn = columnLength - 1;
  const stay: Cell = [row, column];

  switch (key) {
    case 'ArrowRight':
      if (column < lastColumn) return [row, column + 1];

      return row < lastRow ? [row + 1, 0] : stay;
    case 'ArrowLeft':
      if (column > 0) return [row, column - 1];

      return row > 0 ? [row - 1, lastColumn] : stay;
    case 'ArrowUp':
      return row > 0 ? [row - 1, column] : stay;
    case 'ArrowDown':
      return row < lastRow ? [row + 1, column] : stay;
  }
};

const useArrowKey = (
  key: ArrowKey,
  { activeCell, setActiveCell, scope }: IRecordTableHotkeyContext,
  rowLength: number,
  columnLength: number,
) =>
  useScopedHotkeys(
    key,
    () => {
      const [row, column] = nextCell(activeCell, key, rowLength, columnLength);

      if (row !== activeCell[0] || column !== activeCell[1]) {
        setActiveCell([row, column]);
      }
    },
    scope,
  );

export const RecordTableHotkeyProvider = ({
  children,
  columnLength,
  rowLength,
  scope,
}: {
  children: React.ReactNode;
  columnLength: number;
  rowLength: number;
  scope: string;
}) => {
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<Cell>([0, -1]);
  const value = { activeRow, activeCell, setActiveRow, setActiveCell, scope };

  useArrowKey('ArrowRight', value, rowLength, columnLength);
  useArrowKey('ArrowLeft', value, rowLength, columnLength);
  useArrowKey('ArrowUp', value, rowLength, columnLength);
  useArrowKey('ArrowDown', value, rowLength, columnLength);

  return (
    <RecordTableHotkeyContext.Provider value={value}>{children}</RecordTableHotkeyContext.Provider>
  );
};

export const useRecordTableHotkey = () => {
  const context = useContext(RecordTableHotkeyContext);

  if (!context) {
    throw new Error('useRecordTableHotkey must be used within a RecordTableHotkeyProvider.');
  }

  return context;
};
