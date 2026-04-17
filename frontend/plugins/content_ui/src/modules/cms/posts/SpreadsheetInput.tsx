import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useMemo, type ClipboardEvent } from 'react';

interface SpreadsheetInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type Grid = string[][];

const parseTsv = (tsv: string): Grid => {
  if (!tsv) return [['']];
  const rows = tsv.split(/\r?\n/).map((row) => row.split('\t'));
  return rows.length > 0 ? rows : [['']];
};

const serializeTsv = (grid: Grid): string =>
  grid.map((row) => row.join('\t')).join('\n');

const normalizeGrid = (grid: Grid): Grid => {
  const maxCols = Math.max(1, ...grid.map((row) => row.length));
  return grid.map((row) => {
    const copy = [...row];
    while (copy.length < maxCols) copy.push('');
    return copy;
  });
};

const writePastedCells = (
  grid: Grid,
  pasted: Grid,
  startRow: number,
  startCol: number,
): Grid => {
  const copy: Grid = grid.map((row) => [...row]);
  for (let i = 0; i < pasted.length; i++) {
    const rowIdx = startRow + i;
    while (copy.length <= rowIdx) copy.push([]);
    const pastedRow = pasted[i];
    for (let j = 0; j < pastedRow.length; j++) {
      const colIdx = startCol + j;
      while (copy[rowIdx].length <= colIdx) copy[rowIdx].push('');
      copy[rowIdx][colIdx] = pastedRow[j];
    }
  }
  return normalizeGrid(copy);
};

export const SpreadsheetInput = ({
  value,
  onChange,
  placeholder,
}: SpreadsheetInputProps) => {
  const grid = useMemo(() => normalizeGrid(parseTsv(value)), [value]);
  const numCols = grid[0]?.length ?? 1;

  const updateCell = (r: number, c: number, next: string) => {
    const copy: Grid = grid.map((row) => [...row]);
    copy[r][c] = next;
    onChange(serializeTsv(copy));
  };

  const handlePaste = (
    r: number,
    c: number,
    e: ClipboardEvent<HTMLInputElement>,
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text.includes('\t') && !text.includes('\n')) return;
    e.preventDefault();
    onChange(serializeTsv(writePastedCells(grid, parseTsv(text), r, c)));
  };

  const addRow = () =>
    onChange(serializeTsv([...grid, Array(numCols).fill('')]));

  const addCol = () => onChange(serializeTsv(grid.map((row) => [...row, ''])));

  const removeRow = (r: number) => {
    if (grid.length <= 1) return;
    onChange(serializeTsv(grid.filter((_, i) => i !== r)));
  };

  const removeCol = (c: number) => {
    if (numCols <= 1) return;
    onChange(serializeTsv(grid.map((row) => row.filter((_, i) => i !== c))));
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="w-10" />
              {grid[0].map((_, c) => (
                <th
                  key={c}
                  className="p-1 text-center border-l border-b font-normal"
                >
                  <button
                    type="button"
                    onClick={() => removeCol(c)}
                    className="text-muted-foreground hover:text-destructive inline-flex"
                    title="Remove column"
                  >
                    <IconTrash size={12} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                <td className="bg-muted text-center border-b">
                  <button
                    type="button"
                    onClick={() => removeRow(r)}
                    className="text-muted-foreground hover:text-destructive inline-flex"
                    title="Remove row"
                  >
                    <IconTrash size={12} />
                  </button>
                </td>
                {row.map((cell, c) => (
                  <td key={c} className="border-l border-b p-0">
                    <input
                      type="text"
                      value={cell}
                      placeholder={r === 0 && c === 0 ? placeholder : undefined}
                      onChange={(e) => updateCell(r, c, e.target.value)}
                      onPaste={(e) => handlePaste(r, c, e)}
                      className="w-full min-w-24 px-2 py-1 outline-none focus:bg-accent bg-transparent"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 p-2 border-t bg-muted items-center">
        <Button type="button" size="sm" variant="outline" onClick={addRow}>
          <IconPlus size={14} /> Add row
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={addCol}>
          <IconPlus size={14} /> Add column
        </Button>
        <p className="text-xs text-muted-foreground ml-auto">
          Paste Excel data into any cell
        </p>
      </div>
    </div>
  );
};
