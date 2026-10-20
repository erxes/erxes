import { read, utils } from 'xlsx';

export type TSheetPreviewRequest = {
  url: string;
  isCsv: boolean;
  maxRows: number;
};

export type TSheetPreviewResult =
  | {
      rows: string[][];
      sheetName: string;
      sheetCount: number;
      truncated: boolean;
    }
  | { error: string };

// Off the main thread: SheetJS holds several times the file size in memory.
self.onmessage = async (event: MessageEvent<TSheetPreviewRequest>) => {
  const { url, isCsv, maxRows } = event.data;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Storage returned ${res.status}`);
    }

    // CSV as text, so UTF-8 (e.g. Cyrillic) isn't read as Latin-1.
    const workbook = isCsv
      ? read(await res.text(), {
          type: 'string',
          sheetRows: maxRows + 1,
          dense: true,
        })
      : read(await res.arrayBuffer(), {
          type: 'array',
          sheetRows: maxRows + 1,
          dense: true,
        });
    const sheetName = workbook.SheetNames[0] || '';
    const sheet = workbook.Sheets[sheetName];
    const rows = sheet
      ? utils.sheet_to_json<string[]>(sheet, {
          header: 1,
          raw: false,
          defval: '',
          blankrows: false,
        })
      : [];
    const result: TSheetPreviewResult = {
      rows: rows
        .slice(0, maxRows)
        .map((row) => row.map((cell) => String(cell))),
      sheetName,
      sheetCount: workbook.SheetNames.length,
      truncated: rows.length > maxRows,
    };

    self.postMessage(result);
  } catch (e) {
    const result: TSheetPreviewResult = { error: (e as Error).message };

    self.postMessage(result);
  }
};
