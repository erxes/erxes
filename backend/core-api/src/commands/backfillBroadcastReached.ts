import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { nanoid } from 'nanoid';

dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const BATCH_SIZE = 1000;
const client = new MongoClient(MONGO_URL);

type ReachedPair = { engageMessageId: string; customerId: string };

/**
 * Fills `broadcast_reached` from the manifests that are still here.
 *
 * Must be run before a retention window is set on `broadcast_recipients`:
 * until this has been through, "has this person been reached" is still being
 * answered out of the manifest, and expiring those rows would put people
 * through a repeating flow a second time.
 *
 * Safe to run again. Every pair is upserted, so a second pass writes nothing
 * and a pass interrupted half way simply carries on.
 */
const flushBatch = async (batch: ReachedPair[]) => {
  if (batch.length === 0) {
    return;
  }

  await client
    .db()
    .collection('broadcast_reached')
    .bulkWrite(
      batch.map(({ engageMessageId, customerId }) => ({
        updateOne: {
          filter: { engageMessageId, customerId },
          update: {
            // The same shape of id the model writes, so nothing downstream has
            // to know which rows arrived this way.
            $setOnInsert: {
              _id: nanoid(),
              engageMessageId,
              customerId,
              firstReachedAt: new Date(),
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
};

const backfillBroadcastReached = async () => {
  await client.connect();

  // Only what actually went out. A skipped or failed row was never reached,
  // and writing it down would stop the next run from trying again.
  const cursor = client
    .db()
    .collection('broadcast_recipients')
    .find(
      { status: 'sent' },
      { projection: { _id: 0, engageMessageId: 1, customerId: 1 } },
    )
    .batchSize(BATCH_SIZE);

  let batch: ReachedPair[] = [];
  let processedCount = 0;

  for await (const row of cursor) {
    const { engageMessageId, customerId } = row as Partial<ReachedPair>;

    if (!engageMessageId || !customerId) {
      continue;
    }

    batch.push({ engageMessageId, customerId });

    if (batch.length < BATCH_SIZE) {
      continue;
    }

    await flushBatch(batch);
    processedCount += batch.length;
    console.info(`Remembered ${processedCount} reached customers`);
    batch = [];
  }

  await flushBatch(batch);
  processedCount += batch.length;
  console.info(`Broadcast reached backfill complete: ${processedCount}`);
};

backfillBroadcastReached()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
