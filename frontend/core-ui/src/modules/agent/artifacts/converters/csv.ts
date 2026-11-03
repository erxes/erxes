export type CsvDelimiter = ',' | '\t' | ';';

export interface IParsedTable {
  rows: string[][];
  delimiter: CsvDelimiter;
}

const countOutsideQuotes = (line: string, char: string): number => {
  let count = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === char && !inQuotes) {
      count++;
    }
  }
  return count;
};

const detectDelimiter = (text: string): CsvDelimiter => {
  const firstLine = text.split('\n', 1)[0] ?? '';
  const candidates: CsvDelimiter[] = [',', '\t', ';'];
  let best: CsvDelimiter = ',';
  let bestCount = 0;
  for (const candidate of candidates) {
    const count = countOutsideQuotes(firstLine, candidate);
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
};

/**
 * RFC4180-style delimited-text parser for artifact fences: quoted fields,
 * doubled-quote escapes, delimiters and newlines inside quotes, and both LF
 * and CRLF input. Delimiter (comma, tab, or semicolon) is detected from the
 * first line.
 */
export const parseDelimitedTable = (content: string): IParsedTable => {
  const text = content.replace(/\r\n?/g, '\n');
  if (text.trim().length === 0) {
    return { rows: [], delimiter: ',' };
  }
  const delimiter = detectDelimiter(text);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // A single empty row is the artifact of one trailing newline.
  const last = rows[rows.length - 1];
  if (last && last.length === 1 && last[0] === '') {
    rows.pop();
  }

  return { rows, delimiter };
};

/** Numeric cells become numbers so downstream writers can type them. */
export const coerceCell = (value: string): string | number => {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) && trimmed.length < 16 ? numeric : value;
};
