import { useMemo } from 'react';

import { parseDelimitedTable } from '../converters/csv';

interface ISpreadsheetPreviewProps {
  content: string;
}

/**
 * Renders delimited-text (CSV/TSV/SV) artifact content as a read-only HTML
 * table. The CSV parser is the same one the download path uses, so what the
 * user sees matches what they get when they hit Download.
 *
 * Replaces an earlier Univer-based editor that rendered as an empty grid
 * whenever its heavy async bundle failed to mount — the lighter preview
 * either shows the data or an explicit empty state, so a blank card no
 * longer looks like a silent failure.
 */
export const SpreadsheetPreview = ({ content }: ISpreadsheetPreviewProps) => {
  const { rows } = useMemo(() => parseDelimitedTable(content), [content]);

  if (rows.length === 0) {
    return (
      <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-muted-foreground">
        Empty table
      </div>
    );
  }

  const [header, ...body] = rows;

  return (
    <div className="max-h-[60vh] w-full overflow-auto rounded-md border bg-card">
      <table className="w-full text-[13px]">
        <thead className="sticky top-0 bg-muted/40">
          <tr>
            {header.map((cell, columnIndex) => (
              <th
                key={columnIndex}
                scope="col"
                className="border-b px-3 py-1.5 text-left font-medium"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/20">
              {row.map((cell, columnIndex) => (
                <td
                  key={columnIndex}
                  className="border-b px-3 py-1.5 align-top"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
