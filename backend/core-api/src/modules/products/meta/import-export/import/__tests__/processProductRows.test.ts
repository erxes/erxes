/**
 * Product import batches against real MongoDB.
 *
 * The unique index on `code` and Mongoose's own validation decide which rows
 * are refused, so every batch is written to a throwaway database:
 *
 * - a refused row is reported on its own, and the rows written beside it are
 *   reported as imported under the ids MongoDB holds for them;
 * - a code repeated inside the file is stored once and every other row
 *   carrying it is refused, each refusal naming its own code; past ten rows
 *   Mongoose sends in string-sorted order, so the stored row is the one sent
 *   first, not always the first in the file;
 * - a row Mongoose rejects before sending does not shift the ids reported for
 *   the rows after it.
 */

import { randomUUID } from 'node:crypto';
import type { IModels } from '~/connectionResolvers';

const DATABASE = `erxes_product_import_test_${randomUUID().replace(/-/g, '')}`;

process.env.MONGO_URL = `mongodb://127.0.0.1:27017/${DATABASE}?directConnection=true`;

jest.setTimeout(30_000);

type IProcessProductRows =
  typeof import('../processProductRows')['processProductRows'];

type TImportRow = Record<string, string>;

let models: IModels;
let processProductRows: IProcessProductRows;

beforeAll(async () => {
  const { default: mongoose } = await import('mongoose');
  const resolvers = await import('~/connectionResolvers');

  ({ processProductRows } = await import('../processProductRows'));
  models = await resolvers.generateModels('test');
  await mongoose.connection.asPromise();
  await models.Products.init();
}, 120_000);

afterEach(async () => {
  await models.Products.collection.deleteMany({});
});

afterAll(async () => {
  const { default: mongoose } = await import('mongoose');

  mongoose.connection.removeAllListeners('disconnected');
  await mongoose.disconnect();

  const cleanup = await mongoose
    .createConnection('mongodb://127.0.0.1:27017/admin?directConnection=true')
    .asPromise();
  await cleanup.useDb(DATABASE).dropDatabase();
  await cleanup.close();
});

/** Every reported id must hold the row it was reported for. */
const expectStoredUnderReportedIds = async (successRows: TImportRow[]) => {
  const stored = await models.Products.find({
    _id: { $in: successRows.map((row) => row._id) },
  }).lean();
  const storedById = new Map(
    stored.map((doc) => [
      doc._id,
      { code: doc.code, unitPrice: doc.unitPrice },
    ]),
  );

  for (const row of successRows) {
    expect(storedById.get(row._id)).toEqual({
      code: row.code,
      unitPrice: Number(row.unitPrice),
    });
  }
};

describe('processProductRows', () => {
  it('refuses only the rows that repeat a code from earlier in the file', async () => {
    await models.Products.create({
      code: '0009',
      name: 'Хуучин',
      unitPrice: 1,
    });

    const rows: TImportRow[] = [
      { code: '0009', name: 'Угаалтуур', unitPrice: '90000' },
      { code: '0010', name: 'Угаалтуур', unitPrice: '120000' },
      { code: 'Унтраалга', name: 'Унтраалга', unitPrice: '20000' },
      { code: 'Унтраалга', name: 'Унтраалга', unitPrice: '2500' },
      { code: 'Унтраалга', name: 'Унтраалга', unitPrice: '6000' },
      { code: '0011', name: 'Холигч', unitPrice: '120000' },
    ];

    const { successRows, errorRows } = await processProductRows(models, rows);

    expect(successRows.map((row) => row.unitPrice)).toEqual([
      '90000',
      '120000',
      '20000',
      '120000',
    ]);
    expect(errorRows.map((row) => row.unitPrice)).toEqual(['2500', '6000']);

    for (const row of errorRows) {
      expect(row.error).toContain('duplicate key');
      expect(row.error).toContain('Унтраалга');
    }

    await expectStoredUnderReportedIds(successRows);
    expect(await models.Products.countDocuments()).toBe(4);
  });

  it('matches refusals to their rows in batches of more than ten', async () => {
    await models.Products.create({ code: 'L-0', name: 'Хуучин', unitPrice: 1 });

    const rows: TImportRow[] = Array.from({ length: 14 }, (_, index) => ({
      code: `L-${index}`,
      name: `Бараа ${index}`,
      unitPrice: String(index + 100),
    }));

    rows[12].code = 'L-11';
    rows[13].code = 'L-2';

    const { successRows, errorRows } = await processProductRows(models, rows);

    expect(successRows).toHaveLength(12);
    expect(errorRows.map((row) => row.code).sort()).toEqual(['L-11', 'L-2']);

    for (const row of errorRows) {
      expect(row.error).toContain(`"${row.code}"`);

      const stored = await models.Products.findOne({ code: row.code }).lean();

      expect(stored?.unitPrice).not.toBe(Number(row.unitPrice));
    }

    await expectStoredUnderReportedIds(successRows);
  });

  it('keeps the ids of later rows right when a row fails validation', async () => {
    const rows: TImportRow[] = [
      { code: 'A-1', name: 'A', unitPrice: '100' },
      { code: 'A-2', name: 'B', unitPrice: '200', status: 'archived' },
      { code: 'A-3', name: 'C', unitPrice: '300' },
    ];

    const { successRows, errorRows } = await processProductRows(models, rows);

    expect(successRows.map((row) => row.code)).toEqual(['A-1', 'A-3']);
    expect(errorRows).toEqual([
      expect.objectContaining({
        code: 'A-2',
        error: expect.stringContaining('status'),
      }),
    ]);
    await expectStoredUnderReportedIds(successRows);
  });

  it('reports a validation failure and a duplicate in the same batch on their own rows', async () => {
    const rows: TImportRow[] = [
      { code: 'B-1', name: 'A', unitPrice: '100' },
      { code: 'B-2', name: 'B', unitPrice: '200', status: 'archived' },
      { code: 'B-DUP', name: 'C', unitPrice: '300' },
      { code: 'B-DUP', name: 'D', unitPrice: '400' },
      { code: 'B-5', name: 'E', unitPrice: '500' },
    ];

    const { successRows, errorRows } = await processProductRows(models, rows);

    expect(successRows.map((row) => row.unitPrice)).toEqual([
      '100',
      '300',
      '500',
    ]);
    expect(errorRows).toEqual([
      expect.objectContaining({
        unitPrice: '200',
        error: expect.stringContaining('status'),
      }),
      expect.objectContaining({
        unitPrice: '400',
        error: expect.stringContaining('B-DUP'),
      }),
    ]);
    await expectStoredUnderReportedIds(successRows);
  });
});
