import { execFileSync } from 'child_process';
import { monitorEventLoopDelay } from 'perf_hooks';
import {
  docxFixture,
  manyParagraphsDocx,
  pdfFixture,
  wordParagraph,
} from './fixtures/documents';

/**
 * Operational behaviour of document parsing on a shared core-api pod: the
 * event loop stays free, limits are enforced, work is bounded and cleaned up.
 * Everything here runs the real parser in real threads/processes.
 */

jest.setTimeout(60_000);

type TDocumentText = typeof import('@/agents/documentText');

const ENV_KEYS = [
  'AGENTS_DOCUMENT_PARSE_CONCURRENCY',
  'AGENTS_DOCUMENT_PARSE_QUEUE',
  'AGENTS_DOCUMENT_PARSE_MEMORY_MB',
];

/** A fresh module (and parser pool) configured through the environment. */
const loadWith = (env: Record<string, string> = {}): TDocumentText => {
  ENV_KEYS.forEach((key) => delete process.env[key]);
  Object.assign(process.env, env);
  let loaded: TDocumentText | undefined;
  jest.isolateModules(() => {
    loaded = jest.requireActual<TDocumentText>('@/agents/documentText');
  });
  if (!loaded) throw new Error('module did not load');
  return loaded;
};

afterEach(() => ENV_KEYS.forEach((key) => delete process.env[key]));

const childProcesses = (): string[] => {
  try {
    return execFileSync('pgrep', ['-P', String(process.pid)])
      .toString()
      .split('\n')
      .filter(Boolean);
  } catch {
    // pgrep exits 1 when there are no matches.
    return [];
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ~180k XML elements: legal, but ~1s of synchronous parsing on one core.
const heavyDocx = () => manyParagraphsDocx(60_000);

describe('event loop and time limit (H1)', () => {
  it('keeps the event loop responsive while a heavy document parses', async () => {
    const { extractAgentsDocumentText } = loadWith();
    const delay = monitorEventLoopDelay({ resolution: 10 });
    delay.enable();
    const result = await extractAgentsDocumentText(heavyDocx(), 'docx');
    // Let a timer stalled by synchronous work fire so the stall is recorded.
    await sleep(30);
    delay.disable();
    expect(result.text.startsWith('Row 0\nRow 1\n')).toBe(true);
    // Other requests on the pod would wait at most this long.
    expect(delay.max / 1e6).toBeLessThan(150);
  });

  it('stops a parse that runs past the time limit', async () => {
    const { extractAgentsDocumentText } = loadWith();
    const bytes = heavyDocx();
    // Earlier tests' worker threads finish tearing down before we measure.
    await sleep(1000);
    const started = Date.now();
    await expect(
      extractAgentsDocumentText(bytes, 'docx', { timeoutMs: 100 }),
    ).rejects.toThrow('Reading the document took too long.');
    expect(Date.now() - started).toBeLessThan(600);
    // The abandoned parse must not keep burning CPU in this process.
    const before = process.cpuUsage();
    await sleep(400);
    const used = process.cpuUsage(before);
    expect((used.user + used.system) / 1000).toBeLessThan(150);
  });

  it('rejects documents past sensible size and complexity limits', async () => {
    const { extractAgentsDocumentText } = loadWith();
    // ~600k XML elements.
    await expect(
      extractAgentsDocumentText(manyParagraphsDocx(200_000), 'docx'),
    ).rejects.toThrow('The document is too large or complex to read.');
    // A few hundred KB that inflates to 40 MiB of XML.
    const inflated = docxFixture(wordParagraph('a'.repeat(40 * 1024 * 1024)));
    expect(inflated.length).toBeLessThan(1024 * 1024);
    await expect(extractAgentsDocumentText(inflated, 'docx')).rejects.toThrow(
      'The document is too large or complex to read.',
    );
  });

  it('reads the largest document the limits admit with default settings', async () => {
    const { extractAgentsDocumentText } = loadWith();
    // ~250k XML elements: just inside the element limit, so it must also fit
    // the default per-parse memory cap rather than fail as too large.
    const result = await extractAgentsDocumentText(
      manyParagraphsDocx(83_000),
      'docx',
    );
    expect(result.text.startsWith('Row 0\n')).toBe(true);
    // ~300k elements is past the limit and refused.
    await expect(
      extractAgentsDocumentText(manyParagraphsDocx(100_000), 'docx'),
    ).rejects.toThrow('The document is too large or complex to read.');
  });

  it('stops a parse that needs more memory than the per-parse cap', async () => {
    const { extractAgentsDocumentText } = loadWith({
      AGENTS_DOCUMENT_PARSE_MEMORY_MB: '32',
    });
    await expect(
      extractAgentsDocumentText(heavyDocx(), 'docx'),
    ).rejects.toThrow('The document is too large or complex to read.');
    // This process is unaffected and keeps parsing smaller documents.
    await expect(
      extractAgentsDocumentText(docxFixture(wordParagraph('Still here')), 'docx'),
    ).resolves.toMatchObject({ text: 'Still here' });
  });
});

describe('shared parse limiter (H2)', () => {
  it('fails fast with a clear busy message once the queue is full', async () => {
    const { extractAgentsDocumentText } = loadWith({
      AGENTS_DOCUMENT_PARSE_CONCURRENCY: '1',
      AGENTS_DOCUMENT_PARSE_QUEUE: '1',
    });
    const started = Date.now();
    const settledAt: number[] = [];
    const results = await Promise.allSettled(
      [heavyDocx(), heavyDocx(), heavyDocx()].map((bytes) =>
        extractAgentsDocumentText(bytes, 'docx').finally(() =>
          settledAt.push(Date.now() - started),
        ),
      ),
    );
    expect(results.map((result) => result.status)).toEqual([
      'fulfilled',
      'fulfilled',
      'rejected',
    ]);
    expect((results[2] as PromiseRejectedResult).reason.message).toBe(
      'Document reading is busy. Try again in a moment.',
    );
    // The overflow request is answered immediately, not after the others.
    expect(Math.min(...settledAt)).toBeLessThan(300);
  });

  it('runs at most the configured number of parses at once', async () => {
    const { extractAgentsDocumentText } = loadWith({
      AGENTS_DOCUMENT_PARSE_CONCURRENCY: '1',
    });
    const started = Date.now();
    const finished: number[] = [];
    await Promise.all(
      [heavyDocx(), heavyDocx()].map((bytes) =>
        extractAgentsDocumentText(bytes, 'docx').then(() =>
          finished.push(Date.now() - started),
        ),
      ),
    );
    finished.sort((a, b) => a - b);
    expect(finished[1]).toBeGreaterThan(finished[0] * 1.6);
  });

  it('counts PDFs and Office documents against the same limit', async () => {
    const { extractAgentsDocumentText } = loadWith({
      AGENTS_DOCUMENT_PARSE_CONCURRENCY: '1',
      AGENTS_DOCUMENT_PARSE_QUEUE: '0',
    });
    const office = extractAgentsDocumentText(heavyDocx(), 'docx');
    await expect(
      extractAgentsDocumentText(pdfFixture(['Queued']), 'pdf'),
    ).rejects.toThrow('Document reading is busy. Try again in a moment.');
    await expect(office).resolves.toBeTruthy();
  });

  it('leaves no idle parser processes behind', async () => {
    const { extractAgentsDocumentText } = loadWith();
    const results = await Promise.all(
      ['One', 'Two', 'Three'].map((line) =>
        extractAgentsDocumentText(pdfFixture([line]), 'pdf'),
      ),
    );
    expect(results.map((result) => result.text)).toEqual(['One', 'Two', 'Three']);
    await sleep(1000);
    expect(childProcesses()).toEqual([]);
  });
});
