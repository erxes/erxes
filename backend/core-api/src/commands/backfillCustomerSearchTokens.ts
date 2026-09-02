import * as dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { generateConfiguredSearchTokens } from 'erxes-api-shared/utils';
import { customerSearchTokenConfig } from '../modules/contacts/db/definitions/customers';

dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const BATCH_SIZE = 1000;
const client = new MongoClient(MONGO_URL);

type CustomerSearchSource = {
  _id: string | ObjectId;
} & Record<string, unknown>;

const flushBatch = async (batch: CustomerSearchSource[]) => {
  if (batch.length === 0) {
    return;
  }

  await client
    .db()
    .collection<CustomerSearchSource>('customers')
    .bulkWrite(
      batch.map(({ _id, ...source }) => ({
        updateOne: {
          filter: { _id },
          update: {
            $set: {
              searchTokens: generateConfiguredSearchTokens(
                source,
                customerSearchTokenConfig,
              ),
            },
          },
        },
      })),
      { ordered: false },
    );
};

const backfillCustomerSearchTokens = async () => {
  await client.connect();

  const customers = client.db().collection<CustomerSearchSource>('customers');
  const projection = Object.fromEntries([
    ['_id', 1],
    ...customerSearchTokenConfig.fields.map(({ path }) => [path, 1]),
  ]);
  // Whoever has not been tokenised yet. Re-running is safe: a customer whose
  // fields produce no tokens is simply written again.
  const cursor = customers
    .find(
      {
        $or: [
          { searchTokens: { $exists: false } },
          { searchTokens: { $size: 0 } },
        ],
      },
      { projection },
    )
    .batchSize(BATCH_SIZE);

  let batch: CustomerSearchSource[] = [];
  let processedCount = 0;

  for await (const customer of cursor) {
    batch.push(customer);

    if (batch.length < BATCH_SIZE) {
      continue;
    }

    await flushBatch(batch);
    processedCount += batch.length;
    console.info(`Backfilled search tokens for ${processedCount} customers`);
    batch = [];
  }

  await flushBatch(batch);
  processedCount += batch.length;
  console.info(`Customer search token backfill complete: ${processedCount}`);
};

backfillCustomerSearchTokens()
  .catch((error: unknown) => {
    console.error('Customer search token backfill failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
