import { Readable } from 'stream';
import { Job } from 'bullmq';
import { readFileStreamFromStorage } from '../../../utils/file/read';
import { ImportJobData, TImportHandlers } from '../types';
import { CoreImportClient } from './createCoreImportClient';
import { createImportBatchProcessor } from './importBatchProcess';

jest.mock('../../../utils/file/read', () => ({
  readFileStreamFromStorage: jest.fn(),
}));

jest.mock('../../automations', () => ({
  splitType: (type: string) => type.replace(/\./g, ':').split(':'),
}));

const ROW_COUNT = 12000;

const csv = [
  'Code',
  ...Array.from({ length: ROW_COUNT }, (_, index) => `C${index + 1}`),
].join('\n');

type TImportDoc = Record<string, unknown> & { lastProcessedRow?: number };

const createHarness = () => {
  const importDoc: TImportDoc = {
    _id: 'import-1',
    fileName: 'products.csv',
    columnMapping: [{ index: 0, header: 'Code', key: 'code' }],
  };
  const insertedCodes: string[] = [];
  let failNextBatchAt: number | undefined;
  let batchCalls = 0;

  const coreClient = {
    getImport: async () => ({ ...importDoc }),
    updateImportProgress: async (
      _subdomain: string,
      _importId: string,
      progress: Record<string, unknown>,
    ) => {
      Object.assign(importDoc, progress);
    },
    addImportedIds: async () => undefined,
    saveErrorFile: async () => null,
  } as unknown as CoreImportClient;

  const config: TImportHandlers = {
    getImportHeaders: async () => [{ label: 'Code', key: 'code' }],
    insertImportRows: async ({ data }) => {
      batchCalls++;

      if (failNextBatchAt === batchCalls) {
        failNextBatchAt = undefined;
        throw new Error('connection reset');
      }

      const rows = data.rows as Array<{ code: string }>;
      insertedCodes.push(...rows.map((row) => row.code));

      return {
        successRows: rows.map((row) => ({ ...row, _id: row.code })),
        errorRows: [],
      };
    },
  };

  const processor = createImportBatchProcessor(config, coreClient, 'core');
  const job = {
    data: {
      subdomain: 'test',
      data: {
        importId: 'import-1',
        entityType: 'core:product.product',
        fileKey: 'products.csv',
        userId: 'user-1',
      },
    },
  } as unknown as Job<ImportJobData>;

  return {
    importDoc,
    insertedCodes,
    run: () => processor(job),
    failBatch: (call: number) => {
      failNextBatchAt = batchCalls + call;
    },
  };
};

beforeEach(() => {
  jest
    .mocked(readFileStreamFromStorage)
    .mockImplementation(async () => Readable.from([csv]));
});

describe('createImportBatchProcessor resume', () => {
  it('replays a failed batch on retry instead of skipping it', async () => {
    const harness = createHarness();

    harness.failBatch(2);
    await expect(harness.run()).rejects.toThrow('connection reset');

    expect(harness.importDoc.status).toBe('failed');
    expect(harness.importDoc.lastProcessedRow).toBe(5000);
    expect(harness.importDoc.processedRows).toBe(5000);

    await harness.run();

    expect(harness.importDoc.status).toBe('completed');
    expect(harness.importDoc.processedRows).toBe(ROW_COUNT);
    expect(harness.importDoc.successRows).toBe(ROW_COUNT);
    expect(harness.insertedCodes).toHaveLength(ROW_COUNT);
    expect(new Set(harness.insertedCodes).size).toBe(ROW_COUNT);
  });

  it('resumes at the first row of the next batch after an interruption', async () => {
    const harness = createHarness();

    harness.failBatch(2);
    await expect(harness.run()).rejects.toThrow();

    const replayed = harness.insertedCodes.length;

    await harness.run();

    expect(harness.insertedCodes[replayed]).toBe('C5001');
  });
});
