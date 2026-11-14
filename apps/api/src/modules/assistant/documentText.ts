import { z } from 'zod';
import type { DocumentFormat, DocumentJob } from './documentText.worker';
import { runWorker, workerGate } from './workers';

const PARSE_TIMEOUT_MS = 20_000;

const PARSES_AT_ONCE = 2;

const PARSES_WAITING = 4;

const WORKER_HEAP_MB = 384;

const Result = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), text: z.string(), truncated: z.boolean(), scanned: z.boolean() }),
  z.object({ ok: z.literal(false), code: z.string() }),
]);

export class DocumentTextError extends Error {
  constructor(
    message: string,
    readonly busy = false,
  ) {
    super(message);
  }
}

const BUSY = 'Documents are being read for other members; try again in a moment';

const TIMED_OUT = 'Reading the document took too long';

const TOO_LARGE = 'The document is too large or complex to read';

const UNREADABLE = 'The document could not be read; attach a valid, unprotected file';

const LIMIT_CODES = new Set([
  'ZIP_SIZE_LIMIT_EXCEEDED',
  'ZIP_ENTRY_COUNT_LIMIT_EXCEEDED',
  'XML_ELEMENT_LIMIT_EXCEEDED',
  'MAX_NESTING_DEPTH_EXCEEDED',
  'OUTPUT_TOO_LARGE',
  'TABLE_GRID_LIMIT_EXCEEDED',
]);

const messageFor = (code: string) => {
  if (LIMIT_CODES.has(code)) return TOO_LARGE;

  if (code === 'PASSWORD_REQUIRED' || code === 'PASSWORD_INCORRECT') {
    return 'The document is password-protected; attach an unprotected copy';
  }

  return UNREADABLE;
};

const MARKERS: Record<DocumentFormat, (bytes: Buffer) => boolean> = {
  pdf: (bytes) => bytes.subarray(0, 5).toString('latin1') === '%PDF-',
  docx: (bytes) => isZip(bytes) && bytes.includes('word/document.xml', 0, 'latin1'),
  xlsx: (bytes) => isZip(bytes) && bytes.includes('xl/workbook.xml', 0, 'latin1'),
};

const isZip = (bytes: Buffer) => bytes.subarray(0, 4).toString('latin1') === 'PK\u0003\u0004';

const gate = workerGate(PARSES_AT_ONCE, PARSES_WAITING);

const parse = async (job: DocumentJob, signal: AbortSignal) => {
  const end = await runWorker(
    'documentText.worker',
    { data: job, heapMb: WORKER_HEAP_MB, signal },
    (message) => Result.safeParse(message),
  ).finally(gate.release);

  if (end.ended === 'aborted') throw new DocumentTextError(TIMED_OUT);

  if (end.ended === 'out-of-memory') throw new DocumentTextError(TOO_LARGE);

  if (end.ended === 'failed' || !end.answer.success) throw new DocumentTextError(UNREADABLE);

  return end.answer.data;
};

export const documentText = async (bytes: Buffer, format: DocumentFormat, maxChars: number) => {
  if (!MARKERS[format](bytes)) throw new DocumentTextError(UNREADABLE);

  const signal = AbortSignal.timeout(PARSE_TIMEOUT_MS);
  const granted = await gate.acquire(signal);

  if (granted === 'full') throw new DocumentTextError(BUSY, true);

  if (granted === 'timed-out') throw new DocumentTextError(TIMED_OUT);

  const result = await parse({ bytes: new Uint8Array(bytes), format, maxChars }, signal);

  if (!result.ok) throw new DocumentTextError(messageFor(result.code));

  return {
    text: result.scanned ? '(No text found: the PDF is probably scanned images.)' : result.text,
    truncated: result.truncated,
  };
};
