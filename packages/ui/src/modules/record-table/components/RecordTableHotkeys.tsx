import { useRender } from '@base-ui/react/use-render';
import { useAtomValue } from 'jotai';
import {
  createContext,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { cn } from 'erxes-ui/lib/utils';
import { useScopedHotkeys } from 'erxes-ui/modules/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from 'erxes-ui/modules/hotkey/hooks/useSetHotkeyScope';
import { internalHotkeysEnabledScopesState } from 'erxes-ui/modules/hotkey/states/internal/internalHotkeysEnabledScopeState';

type Cell = [row: number, column: number];

interface HotkeyTable {
  activeRow: string | null;
  activeCell: Cell;
  setActiveRow: (rowId: string | null) => void;
  setActiveCell: (cell: Cell) => void;
  scope: string;
}

const HotkeyTableContext = createContext<HotkeyTable | null>(null);

const useHotkeyTable = () => {
  const context = useContext(HotkeyTableContext);

  if (!context) {
    throw new Error('RecordTableHotKeyControl must be inside a RecordTableHotkeyProvider');
  }

  return context;
};

/** The arrow keys move the active cell, wrapping from a row's end to the next row. */
const ArrowKeys = ({ columnLength, rowLength }: { columnLength: number; rowLength: number }) => {
  const { activeCell, setActiveCell, scope } = useHotkeyTable();
  const [row, column] = activeCell;
  const lastColumn = columnLength - 1;

  useScopedHotkeys(
    'ArrowRight',
    () => {
      if (row === rowLength - 1 && column === lastColumn) return;

      setActiveCell(column === lastColumn ? [row + 1, 0] : [row, column + 1]);
    },
    scope,
  );

  useScopedHotkeys(
    'ArrowLeft',
    () => {
      if (row === 0 && column === 0) return;

      setActiveCell(column === 0 ? [row - 1, lastColumn] : [row, column - 1]);
    },
    scope,
  );

  useScopedHotkeys('ArrowUp', () => row > 0 && setActiveCell([row - 1, column]), scope);

  useScopedHotkeys(
    'ArrowDown',
    () => row < rowLength - 1 && setActiveCell([row + 1, column]),
    scope,
  );

  return null;
};

/**
 * A grid of form cells that the arrow keys move through.
 * The keys work while hotkey `scope` is on. Each cell is a `RecordTableHotKeyControl`; Enter presses the active cell's button.
 */
export const RecordTableHotkeyProvider = ({
  children,
  columnLength,
  rowLength,
  scope,
}: {
  children: ReactNode;
  columnLength: number;
  rowLength: number;
  scope: string;
}) => {
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<Cell>([0, -1]);

  const table = useMemo(
    () => ({ activeRow, activeCell, setActiveRow, setActiveCell, scope }),
    [activeRow, activeCell, scope],
  );

  return (
    <HotkeyTableContext.Provider value={table}>
      {children}
      <ArrowKeys columnLength={columnLength} rowLength={rowLength} />
    </HotkeyTableContext.Provider>
  );
};

/**
 * Makes its one child, a table cell, a stop of the grid's arrow keys.
 * It goes inside a `RecordTableHotkeyProvider`. A click makes it active; the active cell is outlined, and Enter presses its first button.
 * `colIndex` defaults to the cell's own index in its row.
 */
export const RecordTableHotKeyControl = ({
  rowId,
  rowIndex,
  colIndex,
  enableOnFormTags = false,
  className,
  onClickCapture,
  children,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  rowId: string;
  rowIndex: number;
  colIndex?: number;
  enableOnFormTags?: boolean;
  children: ReactElement;
}) => {
  const [cell, setCell] = useState<Element | null>(null);
  const { activeCell, setActiveRow, setActiveCell, scope } = useHotkeyTable();
  const enabledScopes = useAtomValue(internalHotkeysEnabledScopesState);
  const setHotkeyScope = useSetHotkeyScope();
  const column = colIndex ?? (cell instanceof HTMLTableCellElement ? cell.cellIndex : 0);
  const isActive = activeCell[0] === rowIndex && activeCell[1] === column;

  useHotkeys(
    'Enter',
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      cell?.querySelector('button')?.click();
    },
    { enabled: isActive && enabledScopes.includes(scope), preventDefault: true, enableOnFormTags },
    [cell, enableOnFormTags],
  );

  useEffect(() => {
    if (!isActive) return undefined;

    setHotkeyScope(scope);
    setActiveRow(rowId);

    // Leaving the cell by the arrow keys takes the cursor out of its input.
    return () => {
      const focused = document.activeElement;

      if (focused instanceof HTMLElement && cell?.contains(focused)) focused.blur();
    };
  }, [isActive, cell, rowId, scope, setActiveRow, setHotkeyScope]);

  return useRender({
    render: children,
    ref: setCell,
    props: {
      ...props,
      onClickCapture: (event: React.MouseEvent<HTMLElement>) => {
        onClickCapture?.(event);
        setActiveCell([rowIndex, column]);
      },
      className: cn(
        isActive && '*:rounded *:outline-1 *:outline-offset-0 *:outline-primary *:outline-solid',
        className,
      ),
    },
  });
};
