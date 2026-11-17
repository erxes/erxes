import writeXlsxFile from 'write-excel-file/browser';
import { isNumeric } from './csvRows';

export const csvToXlsx = (title: string, rows: string[][]) => {
  const [header = [], ...body] = rows;

  return writeXlsxFile(
    [
      header.map((value) => ({ value, fontWeight: 'bold' as const })),
      ...body.map((row) =>
        row.map((value) =>
          isNumeric(value) ? { value: Number(value), type: Number } : { value, type: String },
        ),
      ),
    ],
    { sheet: title.slice(0, 31).replaceAll(/[\\/?*[\]:]/g, ' ') || 'Sheet1', stickyRowsCount: 1 },
  ).toBlob();
};
