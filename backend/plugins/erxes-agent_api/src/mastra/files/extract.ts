import * as path from 'path';
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

export function isImageType(name: string, mimeType?: string): boolean {
  if (mimeType?.startsWith('image/')) return true;
  const ext = fileExtension(name);
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(
    ext,
  );
}

export function fileExtension(name: string): string {
  return path
    .extname(name || '')
    .replace('.', '')
    .toLowerCase();
}

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

function stripHtml(html: string): string {
  return decodeHtmlEntities(stripAllTags(stripScriptAndStyleBlocks(html)))
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

async function extractPdf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfParse = require('pdf-parse');
  const parsed = await pdfParse(buffer);
  const pages = parsed.numpages
    ? `[PDF — ${parsed.numpages} page${parsed.numpages === 1 ? '' : 's'}]\n`
    : '';
  return pages + (parsed.text || '').trim();
}

async function extractDocx(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return (result.value || '').trim();
}

// Render each worksheet as CSV-ish rows. Formula cells report their computed
// result; rich-text and dates collapse to display strings.
async function extractXlsx(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const out: string[] = [];
  workbook.eachSheet((sheet: any) => {
    out.push(`=== Sheet: ${sheet.name} (${sheet.rowCount} rows) ===`);
    let emitted = 0;
    sheet.eachRow({ includeEmpty: false }, (row: any) => {
      if (emitted >= MAX_SHEET_ROWS) return;
      const values = (Array.isArray(row.values) ? row.values.slice(1) : []).map(
        (v: any) => {
          if (v == null) return '';
          if (typeof v === 'object') {
            if (v.result !== undefined) return String(v.result);
            if (v.text !== undefined) return String(v.text);
            if (v.richText) return v.richText.map((r: any) => r.text).join('');
            if (v instanceof Date) return v.toISOString();
            if (v.hyperlink) return String(v.text ?? v.hyperlink);
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
    throw new Error(
      'This is an image — it is shown to the model directly with the message; there is no text to extract.',
    );
  }

  if (ext === 'doc') {
    throw new Error(
      'Legacy .doc files are not supported. Ask the user to re-save the document as .docx or .pdf.',
    );
  }

  throw new Error(
    `Unsupported file format "${
      ext || mimeType || 'unknown'
    }". Supported: pdf, docx, xlsx, csv, txt, md, json, html.`,
  );
}
