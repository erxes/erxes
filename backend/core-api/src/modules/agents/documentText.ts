import { inflateRawSync } from 'zlib';

/**
 * Text extraction for Office Open XML attachments (DOCX, XLSX) without a
 * document library: a bounded ZIP reader over node:zlib plus a tag scanner.
 * Output is plain text for the model; formatting, images and formulas are
 * not preserved.
 */

export const AGENTS_DOCUMENT_TEXT_MAX_CHARS = 128 * 1024;
const ZIP_ENTRY_MAX_BYTES = 16 * 1024 * 1024;
const ZIP_TOTAL_MAX_BYTES = 48 * 1024 * 1024;
const ZIP_MAX_ENTRIES = 5000;
const XLSX_MAX_SHEETS = 20;
const XLSX_MAX_COLUMNS = 200;
const TRUNCATED_NOTICE =
  '\n\n[Truncated: the document has more content than can be read at once.]';

export const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export class AgentsDocumentTextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentsDocumentTextError';
  }
}

interface IZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  size: number;
  offset: number;
}

export const isZipBuffer = (bytes: Buffer): boolean =>
  bytes.length >= 4 && bytes.readUInt32LE(0) === 0x04034b50;

const invalid = (): never => {
  throw new AgentsDocumentTextError('The document could not be read.');
};

const listZipEntries = (bytes: Buffer): Map<string, IZipEntry> => {
  const floor = Math.max(0, bytes.length - 0xffff - 22);
  let eocd = -1;
  for (let index = bytes.length - 22; index >= floor; index -= 1) {
    if (bytes.readUInt32LE(index) === 0x06054b50) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) invalid();
  const count = bytes.readUInt16LE(eocd + 10);
  let cursor = bytes.readUInt32LE(eocd + 16);
  if (count > ZIP_MAX_ENTRIES || cursor === 0xffffffff) invalid();

  const entries = new Map<string, IZipEntry>();
  for (let index = 0; index < count; index += 1) {
    if (cursor + 46 > bytes.length || bytes.readUInt32LE(cursor) !== 0x02014b50)
      invalid();
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const extraLength = bytes.readUInt16LE(cursor + 30);
    const commentLength = bytes.readUInt16LE(cursor + 32);
    const name = bytes.toString('utf8', cursor + 46, cursor + 46 + nameLength);
    entries.set(name, {
      name,
      method: bytes.readUInt16LE(cursor + 10),
      compressedSize: bytes.readUInt32LE(cursor + 20),
      size: bytes.readUInt32LE(cursor + 24),
      offset: bytes.readUInt32LE(cursor + 42),
    });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
};

class ZipReader {
  private readonly entries: Map<string, IZipEntry>;
  private inflated = 0;

  constructor(private readonly bytes: Buffer) {
    this.entries = listZipEntries(bytes);
  }

  has(name: string): boolean {
    return this.entries.has(name);
  }

  read(name: string): string | undefined {
    const entry = this.entries.get(name);
    if (!entry) return undefined;
    const { bytes } = this;
    const header = entry.offset;
    if (header + 30 > bytes.length || bytes.readUInt32LE(header) !== 0x04034b50)
      invalid();
    const start =
      header + 30 + bytes.readUInt16LE(header + 26) + bytes.readUInt16LE(header + 28);
    const end = start + entry.compressedSize;
    if (end > bytes.length || entry.size > ZIP_ENTRY_MAX_BYTES) invalid();
    const remaining = ZIP_TOTAL_MAX_BYTES - this.inflated;
    if (remaining <= 0 || entry.size > remaining) invalid();
    const raw = bytes.subarray(start, end);
    let data: Buffer;
    if (entry.method === 0) {
      data = raw;
    } else if (entry.method === 8) {
      try {
        // The declared size is untrusted; cap actual output too.
        data = inflateRawSync(raw, {
          maxOutputLength: Math.min(ZIP_ENTRY_MAX_BYTES, remaining),
        });
      } catch {
        return invalid();
      }
    } else {
      return invalid();
    }
    this.inflated += data.length;
    return data.toString('utf8');
  }
}

const decodeXml = (value: string): string =>
  value.replace(/&(#x[0-9a-f]+|#\d+|lt|gt|amp|quot|apos);/gi, (match, code: string) => {
    const lower = code.toLowerCase();
    if (lower === 'lt') return '<';
    if (lower === 'gt') return '>';
    if (lower === 'amp') return '&';
    if (lower === 'quot') return '"';
    if (lower === 'apos') return "'";
    const point = lower.startsWith('#x')
      ? Number.parseInt(lower.slice(2), 16)
      : Number.parseInt(lower.slice(1), 10);
    return Number.isInteger(point) && point >= 0 && point <= 0x10ffff
      ? String.fromCodePoint(point)
      : match;
  });

const TAG = /<(\/?)([A-Za-z_][\w.-]*:)?([A-Za-z_][\w.-]*)([^>]*?)(\/?)>|([^<]+)/g;

/** Paragraph text from WordprocessingML, keeping tabs, breaks and table cells. */
export const docxXmlToText = (xml: string): string => {
  let out = '';
  let inText = false;
  let cellDepth = 0;
  for (const match of xml.matchAll(TAG)) {
    const [, closing, , local, , selfClosing, text] = match;
    if (text !== undefined) {
      if (inText) out += decodeXml(text);
      continue;
    }
    if (local === 't') {
      inText = !closing && !selfClosing;
    } else if (local === 'tc' && !selfClosing) {
      if (closing) {
        cellDepth = Math.max(0, cellDepth - 1);
        out += '\t';
      } else {
        cellDepth += 1;
      }
    } else if (closing && local === 'p') {
      out += cellDepth > 0 ? ' ' : '\n';
    } else if (closing && local === 'tr') {
      out += '\n';
    } else if (!closing && (local === 'tab' || local === 'br' || local === 'cr')) {
      out += local === 'tab' ? '\t' : '\n';
    }
  }
  return out
    .replace(/ +\t/g, '\t')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const attribute = (attrs: string, name: string): string | undefined => {
  const match = new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(attrs);
  return match ? decodeXml(match[1]) : undefined;
};

/** Text of every `<t>` run inside `xml`; used for shared and inline strings. */
const runsText = (xml: string): string => {
  let out = '';
  let inText = false;
  let inPhonetic = false;
  for (const match of xml.matchAll(TAG)) {
    const [, closing, , local, , selfClosing, text] = match;
    if (text !== undefined) {
      if (inText && !inPhonetic) out += decodeXml(text);
    } else if (local === 't') {
      inText = !closing && !selfClosing;
    } else if (local === 'rPh') {
      inPhonetic = !closing && !selfClosing;
    }
  }
  return out;
};

const sharedStrings = (xml: string | undefined): string[] =>
  xml
    ? Array.from(xml.matchAll(/<(?:\w+:)?si\b[^>]*>([\s\S]*?)<\/(?:\w+:)?si>/g), (match) =>
        runsText(match[1]),
      )
    : [];

const columnIndex = (reference: string | undefined, fallback: number): number => {
  const letters = reference?.match(/^[A-Z]+/i)?.[0];
  if (!letters) return fallback;
  let index = 0;
  for (const letter of letters.toUpperCase()) {
    index = index * 26 + (letter.charCodeAt(0) - 64);
  }
  return index - 1;
};

const csvCell = (value: string): string =>
  /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const CELL = /<(?:\w+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?c>)/g;
const ROW = /<(?:\w+:)?row\b[^>]*?(?:\/>|>([\s\S]*?)<\/(?:\w+:)?row>)/g;

const sheetToCsv = (xml: string, strings: string[]): string => {
  const lines: string[] = [];
  for (const row of xml.matchAll(ROW)) {
    const cells: string[] = [];
    let next = 0;
    for (const cell of (row[1] ?? '').matchAll(CELL)) {
      const attrs = cell[1];
      const body = cell[2] ?? '';
      const index = columnIndex(attribute(attrs, 'r'), next);
      next = index + 1;
      if (index >= XLSX_MAX_COLUMNS) continue;
      const type = attribute(attrs, 't');
      const raw = /<(?:\w+:)?v\b[^>]*>([\s\S]*?)<\/(?:\w+:)?v>/.exec(body)?.[1];
      let value = '';
      if (type === 's') value = strings[Number(raw)] ?? '';
      else if (type === 'inlineStr') value = runsText(body);
      else if (type === 'b') value = raw === '1' ? 'TRUE' : raw === '0' ? 'FALSE' : '';
      else if (raw !== undefined) value = decodeXml(raw);
      while (cells.length < index) cells.push('');
      cells[index] = csvCell(value);
    }
    while (cells.length && !cells[cells.length - 1]) cells.pop();
    if (cells.length) lines.push(cells.join(','));
  }
  return lines.join('\n');
};

const resolveSheetPath = (target: string): string => {
  const path = target.startsWith('/') ? target.slice(1) : `xl/${target}`;
  const parts: string[] = [];
  for (const part of path.split('/')) {
    if (part === '..') parts.pop();
    else if (part && part !== '.') parts.push(part);
  }
  return parts.join('/');
};

const xlsxText = (zip: ZipReader): string => {
  const workbook = zip.read('xl/workbook.xml') ?? invalid();
  const rels = zip.read('xl/_rels/workbook.xml.rels') ?? '';
  const targets = new Map<string, string>();
  for (const match of rels.matchAll(/<(?:\w+:)?Relationship\b([^>]*?)\/?>/g)) {
    const id = attribute(match[1], 'Id');
    const target = attribute(match[1], 'Target');
    if (id && target) targets.set(id, resolveSheetPath(target));
  }
  const strings = sharedStrings(zip.read('xl/sharedStrings.xml'));
  const sheets = Array.from(workbook.matchAll(/<(?:\w+:)?sheet\b([^>]*?)\/?>/g)).slice(
    0,
    XLSX_MAX_SHEETS,
  );
  const sections: string[] = [];
  sheets.forEach((match, index) => {
    const name = attribute(match[1], 'name') ?? `Sheet ${index + 1}`;
    const id = /(?:^|\s)[\w-]+:id="([^"]*)"/.exec(match[1])?.[1];
    const path =
      (id && targets.get(id)) ?? `xl/worksheets/sheet${index + 1}.xml`;
    const xml = zip.read(path);
    if (xml === undefined) return;
    const csv = sheetToCsv(xml, strings);
    sections.push(`## Sheet: ${name}\n${csv || '(empty)'}`);
  });
  return sections.join('\n\n');
};

const truncate = (text: string): string =>
  text.length > AGENTS_DOCUMENT_TEXT_MAX_CHARS
    ? text.slice(0, AGENTS_DOCUMENT_TEXT_MAX_CHARS) + TRUNCATED_NOTICE
    : text;

/**
 * Extracts DOCX/XLSX text from archive bytes. Returns undefined for other
 * ZIP files; throws for corrupt or oversized documents.
 */
export const extractOfficeDocumentText = (
  bytes: Buffer,
): { mimeType: string; text: string } | undefined => {
  if (!isZipBuffer(bytes)) return undefined;
  const zip = new ZipReader(bytes);
  if (zip.has('word/document.xml')) {
    const xml = zip.read('word/document.xml') ?? invalid();
    return { mimeType: DOCX_MIME_TYPE, text: truncate(docxXmlToText(xml)) };
  }
  if (zip.has('xl/workbook.xml')) {
    return { mimeType: XLSX_MIME_TYPE, text: truncate(xlsxText(zip)) };
  }
  return undefined;
};
