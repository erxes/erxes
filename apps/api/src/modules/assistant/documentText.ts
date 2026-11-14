import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { z } from 'zod';
import type { DocumentFormat, DocumentJob } from './documentText.worker';

const PARSE_TIMEOUT_MS = 20_000;

const PARSES_AT_ONCE = 2;

const PARSES_WAITING = 4;

const WORKER_HEAP_MB = 384;

const WORKER = new URL(
  `./documentText.worker${extname(fileURLToPath(import.meta.url))}`,
  import.meta.url,
);

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

const gate = { running: 0, waiting: [] as (() => void)[] };

const acquire = (signal: AbortSignal) => {
  if (gate.running < PARSES_AT_ONCE) {
    gate.running += 1;

    return Promise.resolve();
  }

  if (gate.waiting.length >= PARSES_WAITING) {
    return Promise.reject(new DocumentTextError(BUSY, true));
  }

  return new Promise<void>((resolve, reject) => {
    const grant = () => {
      signal.removeEventListener('abort', cancel);
      resolve();
    };

    const cancel = () => {
      gate.waiting.splice(gate.waiting.indexOf(grant), 1);
      reject(new DocumentTextError(TIMED_OUT));
    };

    gate.waiting.push(grant);
    signal.addEventListener('abort', cancel, { once: true });
  });
};

const release = () => {
  const next = gate.waiting.shift();

  if (next) next();
  else gate.running -= 1;
};

const runWorker = (job: DocumentJob, signal: AbortSignal) =>
  new Promise<z.infer<typeof Result>>((resolve, reject) => {
    const worker = new Worker(WORKER, {
      workerData: job,
      execArgv: [],
      resourceLimits: { maxOldGenerationSizeMb: WORKER_HEAP_MB, maxYoungGenerationSizeMb: 16 },
    });

    let settled = false;

    const finish = (settle: () => void) => {
      if (settled) return;

      settled = true;
      signal.removeEventListener('abort', abort);
      void worker.terminate();
      settle();
    };

    const abort = () => finish(() => reject(new DocumentTextError(TIMED_OUT)));

    signal.addEventListener('abort', abort, { once: true });
    worker.once('message', (message: unknown) => {
      const parsed = Result.safeParse(message);

      finish(() =>
        parsed.success ? resolve(parsed.data) : reject(new DocumentTextError(UNREADABLE)),
      );
    });
    worker.once('error', (error: Error & { code?: string }) =>
      finish(() =>
        reject(
          new DocumentTextError(error.code === 'ERR_WORKER_OUT_OF_MEMORY' ? TOO_LARGE : UNREADABLE),
        ),
      ),
    );
    worker.once('exit', () => finish(() => reject(new DocumentTextError(UNREADABLE))));
  });

export const documentText = async (bytes: Buffer, format: DocumentFormat, maxChars: number) => {
  if (!MARKERS[format](bytes)) throw new DocumentTextError(UNREADABLE);

  const signal = AbortSignal.timeout(PARSE_TIMEOUT_MS);

  await acquire(signal);

  const result = await runWorker(
    { bytes: new Uint8Array(bytes), format, maxChars },
    signal,
  ).finally(release);

  if (!result.ok) throw new DocumentTextError(messageFor(result.code));

  return {
    text: result.scanned ? '(No text found: the PDF is probably scanned images.)' : result.text,
    truncated: result.truncated,
  };
};
