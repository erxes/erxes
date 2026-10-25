import type { OfficeParserConfig } from 'officeparser';
import { waitForAgentsFileOperation } from '@/agents/fileTimeout';
import {
  AGENTS_DOCUMENT_MIME_TYPES,
  type TAgentsDocumentType,
} from '@/agents/fileValidation';

/**
 * Document text for the `readFile` tool. Parsing is delegated to
 * `officeparser`; this module only picks the format from the bytes, applies
 * resource limits and shapes the text for the model.
 */

export const AGENTS_DOCUMENT_TEXT_MAX_CHARS = 128 * 1024;
export const AGENTS_DOCUMENT_PARSE_TIMEOUT_MS = 20_000;
const TRUNCATED_NOTICE =
  '\n\n[Truncated: the document has more content than can be read at once.]';
const SPREADSHEETS = new Set<TAgentsDocumentType>(['xlsx', 'ods']);

export class AgentsDocumentTextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentsDocumentTextError';
  }
}

const ODF_TYPES: Record<string, TAgentsDocumentType> = {
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
  'application/vnd.oasis.opendocument.presentation': 'odp',
};
// OOXML part names are stored uncompressed in every ZIP entry header.
const OOXML_MARKERS: [string, TAgentsDocumentType][] = [
  ['word/document.xml', 'docx'],
  ['xl/workbook.xml', 'xlsx'],
  ['ppt/presentation.xml', 'pptx'],
];

/** Content sniffing only; file names and declared types are never trusted. */
export const sniffAgentsDocumentType = (
  bytes: Buffer,
): TAgentsDocumentType | undefined => {
  const head = bytes.subarray(0, 128).toString('latin1');
  if (head.startsWith('%PDF-')) return 'pdf';
  if (head.startsWith('{\\rtf')) return 'rtf';
  if (!head.startsWith('PK\x03\x04')) return undefined;
  // ODF packages begin with an uncompressed `mimetype` entry.
  if (bytes.length >= 30 && bytes.readUInt16LE(8) === 0) {
    const nameEnd = 30 + bytes.readUInt16LE(26);
    const dataStart = nameEnd + bytes.readUInt16LE(28);
    const size = bytes.readUInt32LE(18);
    if (bytes.toString('latin1', 30, nameEnd) === 'mimetype' && size <= 100) {
      const odf = ODF_TYPES[bytes.toString('latin1', dataStart, dataStart + size)];
      if (odf) return odf;
    }
  }
  return OOXML_MARKERS.find(([marker]) => bytes.includes(marker, 0, 'latin1'))?.[1];
};

const parserConfig = (
  fileType: TAgentsDocumentType,
  abortSignal: AbortSignal,
): OfficeParserConfig => ({
  fileType,
  abortSignal,
  // Never fetch workers, OCR data or fonts; nothing leaves this process.
  allowRemoteAssets: false,
  ocr: false,
  extractAttachments: false,
  includeRawContent: false,
  ignoreComments: true,
  ignoreSlideMasters: true,
  decompressionLimits: {
    maxUncompressedBytes: 64 * 1024 * 1024,
    maxZipEntries: 5000,
    maxTableCells: 250_000,
    maxXmlElements: 1_000_000,
    maxRepeatedContent: 4 * 1024 * 1024,
  },
  // pdf.js runs in a short-lived child process with its own memory cap.
  pdfParserConfig: {
    separateProcess: true,
    processMemoryMb: 512,
    maxTimeMs: 15_000,
  },
});

const failureMessage = (error: unknown, timedOut: boolean): string => {
  if (timedOut) return 'Reading the document took too long.';
  const code = (error as { officeIssue?: { code?: unknown } } | null)
    ?.officeIssue?.code;
  if (code === 'PASSWORD_REQUIRED' || code === 'PASSWORD_INCORRECT') {
    return 'The document is password-protected. Ask for an unprotected copy.';
  }
  return 'The document could not be read. Upload a valid, unprotected file.';
};

const truncate = (text: string): string =>
  text.length > AGENTS_DOCUMENT_TEXT_MAX_CHARS
    ? text.slice(0, AGENTS_DOCUMENT_TEXT_MAX_CHARS) + TRUNCATED_NOTICE
    : text;

/**
 * Plain text of a document: CSV per sheet for spreadsheets, text with
 * `|`-separated table rows otherwise. Capped at 128 KiB with a notice.
 */
export const extractAgentsDocumentText = async (
  bytes: Buffer,
  type: TAgentsDocumentType,
  { timeoutMs = AGENTS_DOCUMENT_PARSE_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<{ mimeType: string; text: string }> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const { OfficeParser } = await import('officeparser');
    // The parser honours the signal; the wait is bounded even if it does not.
    const ast = await waitForAgentsFileOperation(
      OfficeParser.parseOffice(bytes, parserConfig(type, controller.signal)),
      controller.signal,
    );
    const { value } = await ast.to(SPREADSHEETS.has(type) ? 'csv' : 'text');
    let text = typeof value === 'string' ? value.trim() : '';
    if (
      !text &&
      ast.warnings.some((warning) => warning.code === 'PDF_NO_TEXT_EXTRACTED')
    ) {
      text = '(No text found. This PDF is probably scanned or image-only.)';
    }
    return { mimeType: AGENTS_DOCUMENT_MIME_TYPES[type], text: truncate(text) };
  } catch (error) {
    throw new AgentsDocumentTextError(
      failureMessage(error, controller.signal.aborted),
    );
  } finally {
    clearTimeout(timer);
  }
};
