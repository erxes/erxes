import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import type { AnyBulkWriteOperation, Collection, Db } from 'mongodb';

dotenv.config();

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  BATCH_SIZE = '1000',
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

type PricingDocument = {
  _id: string;
  priority?: '' | 'public' | 'posBase' | null;
  isPriority?: boolean;
} & Record<string, unknown>;

const client = new MongoClient(MONGO_URL);

let db: Db;
let Pricings: Collection<PricingDocument>;

const batchSize = Math.max(Number(BATCH_SIZE) || 1000, 1);

const flush = async (operations: AnyBulkWriteOperation<PricingDocument>[]) => {
  if (!operations.length) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  return Pricings.bulkWrite(operations, { ordered: false });
};

const command = async () => {
  await client.connect();
  db = client.db();
  Pricings = db.collection<PricingDocument>('pricings');

  console.log(`Process start at: ${new Date().toISOString()}`);
  console.log(`Mode: write, batchSize: ${batchSize}`);

  const cursor = Pricings.find({
    isPriority: true,
    $or: [
      { priority: { $exists: false } },
      { priority: null },
      { priority: '' },
    ],
  }).batchSize(batchSize);

  let scannedCount = 0;
  let preparedCount = 0;
  let priorityModifiedCount = 0;
  let operations: AnyBulkWriteOperation<PricingDocument>[] = [];

  for await (const pricing of cursor) {
    scannedCount++;

    operations.push({
      updateOne: {
        filter: { _id: pricing._id },
        update: { $set: { priority: 'posBase' } },
      },
    });

    preparedCount++;

    if (operations.length >= batchSize) {
      const result = await flush(operations);
      priorityModifiedCount += result.modifiedCount || 0;
      console.log(
        `Processed ${scannedCount} pricings, prepared ${preparedCount}, priorityUpdated ${priorityModifiedCount}`,
      );
      operations = [];
    }
  }

  const result = await flush(operations);
  priorityModifiedCount += result.modifiedCount || 0;

  const unsetResult = await Pricings.updateMany(
    { isPriority: { $exists: true } },
    { $unset: { isPriority: 1 } },
  );

  const remainingIsPriorityCount = await Pricings.countDocuments({
    isPriority: { $exists: true },
  });

  console.log(`Scanned legacy priority pricings: ${scannedCount}`);
  console.log(`Prepared priority updates: ${preparedCount}`);
  console.log(`Priority updated documents: ${priorityModifiedCount}`);
  console.log(`Unset isPriority documents: ${unsetResult.modifiedCount || 0}`);
  console.log(`Remaining isPriority fields: ${remainingIsPriorityCount}`);
  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
