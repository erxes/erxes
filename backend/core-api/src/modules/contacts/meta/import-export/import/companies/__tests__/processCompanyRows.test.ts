/**
 * Company import batches against real MongoDB.
 *
 * A batch that mixes an update with more than ten inserts and one row
 * Mongoose refuses must report that row alone, and every other row under the
 * id MongoDB holds for it.
 */

import { randomUUID } from 'node:crypto';
import type { IModels } from '~/connectionResolvers';

const DATABASE = `erxes_company_import_test_${randomUUID().replace(/-/g, '')}`;

process.env.MONGO_URL = `mongodb://127.0.0.1:27017/${DATABASE}?directConnection=true`;

jest.setTimeout(30_000);

type IProcessCompanyRows =
  typeof import('../processCompanyRows')['processCompanyRows'];

type TImportRow = Record<string, string>;

let models: IModels;
let processCompanyRows: IProcessCompanyRows;

beforeAll(async () => {
  const { default: mongoose } = await import('mongoose');
  const resolvers = await import('~/connectionResolvers');

  ({ processCompanyRows } = await import('../processCompanyRows'));
  models = await resolvers.generateModels('test');
  await mongoose.connection.asPromise();
  await models.Companies.init();
}, 120_000);

afterEach(async () => {
  await models.Companies.collection.deleteMany({});
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

describe('processCompanyRows', () => {
  it('reports a refused row on its own in a mixed batch of more than ten', async () => {
    const existing = await models.Companies.create({ primaryName: 'Acme' });

    const rows: TImportRow[] = [
      { primaryName: 'Acme', description: 'updated' },
      ...Array.from({ length: 13 }, (_, index) => ({
        primaryName: `Компани ${index}`,
      })),
    ];

    rows[12].size = '11-50';

    const { successRows, errorRows } = await processCompanyRows(models, rows);

    expect(errorRows).toEqual([
      expect.objectContaining({
        primaryName: 'Компани 11',
        error: expect.stringContaining('size'),
      }),
    ]);
    expect(successRows).toHaveLength(13);
    expect(successRows[0]._id).toBe(existing._id);

    const stored = await models.Companies.find({
      _id: { $in: successRows.map((row) => row._id) },
    }).lean();
    const nameById = new Map(stored.map((doc) => [doc._id, doc.primaryName]));

    for (const row of successRows) {
      expect(nameById.get(row._id)).toBe(row.primaryName);
    }
  });
});
