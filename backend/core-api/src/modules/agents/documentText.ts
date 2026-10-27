import path from 'path';
import { Worker } from 'worker_threads';
import type {
  IAgentsDocumentWorkerInput,
  TAgentsDocumentWorkerResult,
} from '@/agents/documentTextWorker';
import {
  AGENTS_DOCUMENT_MIME_TYPES,
  type TAgentsDocumentType,
} from '@/agents/fileValidation';

/**
 * Document text for the `readFile` tool. Parsing is delegated to
 * `officeparser` in `documentTextWorker.ts`; this module picks the format from
 * the bytes, runs each parse in a bounded worker thread and shapes the text.
 */

export const AGENTS_DOCUMENT_TEXT_MAX_CHARS = 128 * 1024;
export const AGENTS_DOCUMENT_PARSE_TIMEOUT_MS = 20_000;
const TRUNCATED_NOTICE =
  '\n\n[Truncated: the document has more content than can be read at once.]';

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

const positiveEnvInt = (name: string, fallback: number, min: number): number => {
  const raw = process.env[name]?.trim();
  const value = raw ? Number(raw) : Number.NaN;
  return Number.isInteger(value) && value >= min ? value : fallback;
};

interface IParseLimits {
  concurrency: number;
  queue: number;
  memoryMb: number;
}

/**
 * Read on first use so operators can tune a pod without a rebuild.
 *
 * - `AGENTS_DOCUMENT_PARSE_CONCURRENCY` (default 2): parses at once per process.
 * - `AGENTS_DOCUMENT_PARSE_QUEUE` (default 4): parses waiting for a slot;
 *   beyond that a request fails fast as busy.
 * - `AGENTS_DOCUMENT_PARSE_MEMORY_MB` (default 384): heap per parse. The
 *   largest document the decompression limits admit (250k XML elements)
 *   measured just under 384 MB; 320 MB was not enough. Two parses therefore
 *   add at most ~0.75 GB, where officeparser's PDF child processes could take
 *   512 MB per host CPU on top of parsing on the main thread.
 */
let limits: IParseLimits | undefined;
const parseLimits = (): IParseLimits =>
  (limits ??= {
    concurrency: positiveEnvInt('AGENTS_DOCUMENT_PARSE_CONCURRENCY', 2, 1),
    queue: positiveEnvInt('AGENTS_DOCUMENT_PARSE_QUEUE', 4, 0),
    memoryMb: positiveEnvInt('AGENTS_DOCUMENT_PARSE_MEMORY_MB', 384, 16),
  });

// One gate for every format: a slot per running parse, FIFO waiters.
let running = 0;
const waiting: (() => void)[] = [];

const BUSY = 'Document reading is busy. Try again in a moment.';
const TIMED_OUT = 'Reading the document took too long.';
const TOO_LARGE = 'The document is too large or complex to read.';
const UNREADABLE =
  'The document could not be read. Upload a valid, unprotected file.';

const acquireSlot = (signal: AbortSignal): Promise<void> => {
  const { concurrency, queue } = parseLimits();
  if (running < concurrency) {
    running += 1;
    return Promise.resolve();
  }
  if (waiting.length >= queue) {
    return Promise.reject(new AgentsDocumentTextError(BUSY));
  }
  return new Promise((resolve, reject) => {
    const grant = () => {
      signal.removeEventListener('abort', cancel);
      resolve();
    };
    const cancel = () => {
      waiting.splice(waiting.indexOf(grant), 1);
      reject(new AgentsDocumentTextError(TIMED_OUT));
    };
    waiting.push(grant);
    signal.addEventListener('abort', cancel, { once: true });
  });
};

// A released slot passes straight to the next waiter.
const releaseSlot = () => {
  const next = waiting.shift();
  if (next) next();
  else running -= 1;
};

const WORKER_FILE = path.join(
  __dirname,
  `documentTextWorker${path.extname(__filename)}`,
);

/**
 * A fresh worker per parse: its heap is capped and released afterwards, a
 * timeout terminates it mid-parse, and no idle thread or process remains.
 */
const runWorker = (
  input: IAgentsDocumentWorkerInput,
  signal: AbortSignal,
): Promise<TAgentsDocumentWorkerResult> =>
  new Promise((resolve, reject) => {
    const worker = new Worker(WORKER_FILE, {
      resourceLimits: {
        maxOldGenerationSizeMb: parseLimits().memoryMb,
        maxYoungGenerationSizeMb: 16,
      },
    });
    let settled = false;
    const finish = (next: () => void) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', abort);
      void worker.terminate();
      next();
    };
    const abort = () =>
      finish(() => reject(new AgentsDocumentTextError(TIMED_OUT)));
    signal.addEventListener('abort', abort, { once: true });
    worker.once('message', (result: TAgentsDocumentWorkerResult) =>
      finish(() => resolve(result)),
    );
    worker.once('error', (error: Error & { code?: string }) =>
      finish(() =>
        reject(
          new AgentsDocumentTextError(
            error.code === 'ERR_WORKER_OUT_OF_MEMORY' ? TOO_LARGE : UNREADABLE,
          ),
        ),
      ),
    );
    worker.once('exit', () =>
      finish(() => reject(new AgentsDocumentTextError(UNREADABLE))),
    );
    worker.postMessage(input);
  });

const LIMIT_CODES = new Set([
  'ZIP_SIZE_LIMIT_EXCEEDED',
  'ZIP_ENTRY_COUNT_LIMIT_EXCEEDED',
  'XML_ELEMENT_LIMIT_EXCEEDED',
  'MAX_NESTING_DEPTH_EXCEEDED',
  'OUTPUT_TOO_LARGE',
  'TABLE_GRID_LIMIT_EXCEEDED',
]);
const issueMessage = (code: string): string => {
  if (LIMIT_CODES.has(code)) return TOO_LARGE;
  if (code === 'PASSWORD_REQUIRED' || code === 'PASSWORD_INCORRECT') {
    return 'The document is password-protected. Ask for an unprotected copy.';
  }
  return UNREADABLE;
};

/**
 * Plain text of a document: CSV per sheet for spreadsheets, text with
 * `|`-separated table rows otherwise. Capped at 128 KiB with a notice. The
 * parse runs off the event loop; `timeoutMs` covers waiting for a slot and
 * parsing, and terminates the worker when it passes.
 */
export const extractAgentsDocumentText = async (
  bytes: Buffer,
  type: TAgentsDocumentType,
  { timeoutMs = AGENTS_DOCUMENT_PARSE_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<{ mimeType: string; text: string }> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const input: IAgentsDocumentWorkerInput = {
    bytes: new Uint8Array(bytes),
    type,
    maxChars: AGENTS_DOCUMENT_TEXT_MAX_CHARS,
  };
  let result: TAgentsDocumentWorkerResult;
  try {
    await acquireSlot(controller.signal);
    try {
      result = await runWorker(input, controller.signal);
    } finally {
      releaseSlot();
    }
  } finally {
    clearTimeout(timer);
  }
  if (!result.ok) throw new AgentsDocumentTextError(issueMessage(result.code));
  const text = result.noTextInPdf
    ? '(No text found. This PDF is probably scanned or image-only.)'
    : result.text;
  return {
    mimeType: AGENTS_DOCUMENT_MIME_TYPES[type],
    text: result.truncated ? text + TRUNCATED_NOTICE : text,
  };
};
