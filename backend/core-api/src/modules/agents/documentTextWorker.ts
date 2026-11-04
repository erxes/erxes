import { OfficeParser } from 'officeparser';
import type { OfficeParserConfig } from 'officeparser';
import { isMainThread, parentPort } from 'worker_threads';

/**
 * Entry point of the worker thread that parses one document (started by
 * `documentText.ts`), never the core-api event loop. Keep this file free of
 * path aliases and other application imports: dev and tests load it as
 * TypeScript in a fresh thread.
 */

export type TAgentsDocumentWorkerFormat =
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'pptx'
  | 'odt'
  | 'ods'
  | 'odp'
  | 'rtf';

export interface IAgentsDocumentWorkerInput {
  bytes: Uint8Array;
  type: TAgentsDocumentWorkerFormat;
  maxChars: number;
}

export type TAgentsDocumentWorkerResult =
  | { ok: true; text: string; truncated: boolean; noTextInPdf: boolean }
  | { ok: false; code: string };

/**
 * Bounds on the XML a 10 MiB upload may inflate to and the DOM built from it.
 * The parser holds roughly 1.5 KB per element, so 250k elements (a 300-page
 * heavily formatted document or a ~100k-cell sheet; the model sees at most
 * 128 KiB of text anyway) fit the default 384 MB worker heap.
 */
export const AGENTS_DOCUMENT_DECOMPRESSION_LIMITS = {
  maxUncompressedBytes: 32 * 1024 * 1024,
  maxZipEntries: 2_000,
  maxTableCells: 200_000,
  maxXmlElements: 250_000,
  maxRepeatedContent: 2 * 1024 * 1024,
};

const SPREADSHEETS = new Set<TAgentsDocumentWorkerFormat>(['xlsx', 'ods']);

const parserConfig = (
  fileType: TAgentsDocumentWorkerFormat,
): OfficeParserConfig => ({
  fileType,
  // Never fetch workers, OCR data or fonts; nothing leaves this thread.
  allowRemoteAssets: false,
  ocr: false,
  extractAttachments: false,
  includeRawContent: false,
  ignoreComments: true,
  ignoreSlideMasters: true,
  decompressionLimits: AGENTS_DOCUMENT_DECOMPRESSION_LIMITS,
  // pdf.js runs in this worker, under its memory cap and termination, instead
  // of officeparser's own pool of child processes.
  pdfParserConfig: { separateProcess: false },
});

const issueCode = (error: unknown): string => {
  const code = (error as { officeIssue?: { code?: unknown } } | null)
    ?.officeIssue?.code;
  return typeof code === 'string' ? code : 'UNREADABLE';
};

export const parseAgentsDocument = async ({
  bytes,
  type,
  maxChars,
}: IAgentsDocumentWorkerInput): Promise<TAgentsDocumentWorkerResult> => {
  try {
    const ast = await OfficeParser.parseOffice(
      Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength),
      parserConfig(type),
    );
    const { value } = await ast.to(SPREADSHEETS.has(type) ? 'csv' : 'text');
    const text = typeof value === 'string' ? value.trim() : '';
    return {
      ok: true,
      // Only the readable prefix crosses back to the main thread.
      text: text.slice(0, maxChars),
      truncated: text.length > maxChars,
      noTextInPdf:
        !text &&
        ast.warnings.some((warning) => warning.code === 'PDF_NO_TEXT_EXTRACTED'),
    };
  } catch (error) {
    return { ok: false, code: issueCode(error) };
  }
};

if (!isMainThread && parentPort) {
  const port = parentPort;
  port.once('message', (input: IAgentsDocumentWorkerInput) => {
    void parseAgentsDocument(input).then((result) => port.postMessage(result));
  });
}
