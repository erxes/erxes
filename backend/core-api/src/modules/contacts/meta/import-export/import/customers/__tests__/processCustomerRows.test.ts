/**
 * Customer import batches against real MongoDB.
 *
 * A batch that mixes an update with more than ten inserts and one row
 * Mongoose refuses must report that row alone, and every other row under the
 * id MongoDB holds for it.
 */

import { randomUUID } from 'node:crypto';
import type { IModels } from '~/connectionResolvers';

const DATABASE = `erxes_customer_import_test_${randomUUID().replace(/-/g, '')}`;

process.env.MONGO_URL = `mongodb://127.0.0.1:27017/${DATABASE}?directConnection=true`;

jest.setTimeout(30_000);

type IProcessCustomerRows =
  typeof import('../processCustomerRows')['processCustomerRows'];

type TImportRow = Record<string, string>;

let models: IModels;
let processCustomerRows: IProcessCustomerRows;

beforeAll(async () => {
  const { default: mongoose } = await import('mongoose');
  const resolvers = await import('~/connectionResolvers');

  ({ processCustomerRows } = await import('../processCustomerRows'));
  models = await resolvers.generateModels('test');
  await mongoose.connection.asPromise();
  await models.Customers.init();
}, 120_000);

afterEach(async () => {
  await models.Customers.collection.deleteMany({});
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

describe('processCustomerRows', () => {
  it('reports a refused row on its own in a mixed batch of more than ten', async () => {
    const existing = await models.Customers.create({
      firstName: 'Хуучин',
      primaryEmail: 'old@example.mn',
      emails: ['old@example.mn'],
      state: 'customer',
    });

    const rows: TImportRow[] = [
      { primaryEmail: 'old@example.mn', firstName: 'Шинэчилсэн' },
      ...Array.from({ length: 13 }, (_, index) => ({
        primaryEmail: `user${index}@example.mn`,
        firstName: `Хэрэглэгч ${index}`,
      })),
    ];

    rows[12].sex = '7';

    const { successRows, errorRows } = await processCustomerRows(
      models,
      rows,
      'customer',
    );

    expect(errorRows).toEqual([
      expect.objectContaining({
        primaryEmail: 'user11@example.mn',
        error: expect.stringContaining('sex'),
      }),
    ]);
    expect(successRows).toHaveLength(13);
    expect(successRows[0]._id).toBe(existing._id);

    const stored = await models.Customers.find({
      _id: { $in: successRows.map((row) => row._id) },
    }).lean();
    const emailById = new Map(stored.map((doc) => [doc._id, doc.primaryEmail]));

    for (const row of successRows) {
      expect(emailById.get(row._id)).toBe(row.primaryEmail);
    }
  });
});
