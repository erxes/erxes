import { extname } from 'path';
import { ExpectedError } from 'erxes-api-shared/utils';
import {
  decodeHtmlEntities,
  stripAllTags,
  stripScriptAndStyleBlocks,
} from '~/mastra/html';

// ---------------------------------------------------------------------------
// Text extraction from chat attachments. Pure buffer → text; storage access
// lives in storage.ts, the agent-facing tool in tools/attachmentTool.ts.
//
// Supported: pdf (pdf-parse), docx (mammoth), xlsx/xls (exceljs), and any
// plain-text family (txt/csv/md/json/html/...). Images are handled upstream —
// they are inlined into the model message as multimodal parts, not extracted.
// ---------------------------------------------------------------------------

// Keep extractions bounded so one giant spreadsheet can't blow the context
// window — the agent gets the head of the document plus a truncation notice.
export const MAX_EXTRACT_CHARS = 20_000;
const MAX_SHEET_ROWS = 500;

export interface ExtractedFile {
  content: string;
  format: string;
  truncated: boolean;
}

const TEXT_EXTENSIONS = new Set([
  'txt',
  'csv',
  'tsv',
  'md',
  'markdown',
  'json',
  'log',
  'xml',
  'yml',
  'yaml',
  'html',
  'htm',
  'js',
  'ts',
  'css',
  'sql',
  'sh',
  'py',
]);

/** Whether the file is an image (by MIME type, falling back to extension). */
export function isImageType(name: string, mimeType?: string): boolean {
  if (mimeType?.startsWith('image/')) return true;
  const ext = fileExtension(name);
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(
    ext,
  );
}

/** Lower-cased file extension without the leading dot. */
export function fileExtension(name: string): string {
  return extname(name || '')
    .replace('.', '')
    .toLowerCase();
}

/** Bound extracted text to MAX_EXTRACT_CHARS, flagging truncation. */
function clamp(text: string): { content: string; truncated: boolean } {
  if (text.length <= MAX_EXTRACT_CHARS)
    return { content: text, truncated: false };
  return {
    content: `${text.slice(
      0,
      MAX_EXTRACT_CHARS,
    )}\n\n[... truncated — showing first ${MAX_EXTRACT_CHARS} characters of ${
      text.length
    }]`,
    truncated: true,
  };
}

/** Strip markup from an HTML upload so it reads as plain text. */
function stripHtml(html: string): string {
  return decodeHtmlEntities(stripAllTags(stripScriptAndStyleBlocks(html)))
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

// The parser libraries are imported lazily — they are heavy and only needed
// when a matching file type is actually uploaded. Under module:commonjs the
// dynamic import compiles to a deferred require, so laziness is preserved.
async function extractPdf(buffer: Buffer): Promise<string> {
  const { default: pdfParse } = await import('pdf-parse');
  const parsed = await pdfParse(buffer);
  const pages = parsed.numpages
    ? `[PDF — ${parsed.numpages} page${parsed.numpages === 1 ? '' : 's'}]\n`
    : '';
  return pages + (parsed.text || '').trim();
}

/** Extract the raw text of a .docx document. */
async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return (result.value || '').trim();
}

// Cells that carry their value behind a property (formula results, rich text,
// hyperlinks) — structural type, narrowed from exceljs's CellValue union.
interface LooseCell {
  result?: unknown;
  text?: unknown;
  richText?: Array<{ text?: unknown }>;
  hyperlink?: unknown;
}

/** Render each worksheet as CSV-ish text rows. Formula cells report their
 * computed result; rich-text and dates collapse to display strings. */
async function extractXlsx(buffer: Buffer): Promise<string> {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const out: string[] = [];
  workbook.eachSheet((sheet) => {
    out.push(`=== Sheet: ${sheet.name} (${sheet.rowCount} rows) ===`);
    let emitted = 0;
    sheet.eachRow({ includeEmpty: false }, (row) => {
      if (emitted >= MAX_SHEET_ROWS) return;
      const values = (Array.isArray(row.values) ? row.values.slice(1) : []).map(
        (v) => {
          if (v == null) return '';
          if (typeof v === 'object') {
            if (v instanceof Date) return v.toISOString();
            const cell = v as LooseCell;
            if (cell.result !== undefined) return String(cell.result);
            if (cell.text !== undefined) return String(cell.text);
            if (Array.isArray(cell.richText)) {
              return cell.richText.map((r) => String(r?.text ?? '')).join('');
            }
            if (cell.hyperlink) return String(cell.text ?? cell.hyperlink);
            return JSON.stringify(v);
          }
          return String(v);
        },
      );
      out.push(values.join(','));
      emitted++;
    });
    if (sheet.actualRowCount > MAX_SHEET_ROWS) {
      out.push(
        `[... ${sheet.actualRowCount - MAX_SHEET_ROWS} more rows omitted]`,
      );
    }
    out.push('');
  });
  return out.join('\n').trim();
}

/**
 * Extract readable text from a file buffer. Throws a user/agent-facing error
 * for formats that genuinely can't be read as text.
 */
export async function extractFileText(params: {
  buffer: Buffer;
  name: string;
  mimeType?: string;
}): Promise<ExtractedFile> {
  const { buffer, name, mimeType } = params;
  const ext = fileExtension(name);
  const mime = (mimeType || '').toLowerCase();

  if (ext === 'pdf' || mime.includes('application/pdf')) {
    const { content, truncated } = clamp(await extractPdf(buffer));
    return { content, truncated, format: 'pdf' };
  }

  if (ext === 'docx' || mime.includes('officedocument.wordprocessingml')) {
    const { content, truncated } = clamp(await extractDocx(buffer));
    return { content, truncated, format: 'docx' };
  }

  if (
    ext === 'xlsx' ||
    ext === 'xls' ||
    mime.includes('spreadsheetml') ||
    mime.includes('ms-excel')
  ) {
    const { content, truncated } = clamp(await extractXlsx(buffer));
    return { content, truncated, format: 'xlsx' };
  }

  if (ext === 'html' || ext === 'htm' || mime.includes('text/html')) {
    const { content, truncated } = clamp(stripHtml(buffer.toString('utf8')));
    return { content, truncated, format: 'html' };
  }

  if (
    TEXT_EXTENSIONS.has(ext) ||
    mime.startsWith('text/') ||
    mime.includes('json')
  ) {
    const { content, truncated } = clamp(buffer.toString('utf8'));
    return { content, truncated, format: ext || 'text' };
  }

  if (isImageType(name, mimeType)) {
    throw new ExpectedError(
      'This is an image — it is shown to the model directly with the message; there is no text to extract.',
    );
  }

  if (ext === 'doc') {
    throw new ExpectedError(
      'Legacy .doc files are not supported. Ask the user to re-save the document as .docx or .pdf.',
    );
  }

  throw new ExpectedError(
    `Unsupported file format "${
      ext || mimeType || 'unknown'
    }". Supported: pdf, docx, xlsx, csv, txt, md, json, html.`,
  );
}
