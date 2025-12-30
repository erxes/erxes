import ExcelJS from 'exceljs';
import { Readable } from 'stream';

export async function* processCSVFile(
  fileBuffer: Buffer,
): AsyncGenerator<string[], void, unknown> {
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  const csvContent = fileBuffer.toString('utf-8');

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\n' || (char === '\r' && nextChar !== '\n')) {
        currentRow.push(currentField.trim());
        if (currentRow.some((field) => field !== '')) {
          yield currentRow;
        }
        currentRow = [];
        currentField = '';
      }
    } else {
      currentField += char;
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field !== '')) {
      yield currentRow;
    }
  }
}

export async function* processXLSXFile(
  fileBuffer: Buffer,
): AsyncGenerator<any[], void, unknown> {
  const stream = Readable.from(fileBuffer);
  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(stream, {
    entries: 'emit',
  });

  for await (const worksheet of workbook) {
    for await (const row of worksheet) {
      const values = row.values as any[];
      const rowData = values.map((value) => value?.toString() || '');
      yield rowData;
    }
  }
}
