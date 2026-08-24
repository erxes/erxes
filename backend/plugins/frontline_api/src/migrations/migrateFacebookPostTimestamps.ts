const { MongoClient } = require('mongodb');
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb://localhost:27017/erxes?directConnection=true';

const DRY_RUN = process.env.DRY_RUN === 'true';

const EPOCH_SECONDS_CUTOFF = new Date('2000-01-01T00:00:00Z');

if (!MONGO_URL) {
  throw new Error('MONGO_URL not provided');
}

const client = new MongoClient(MONGO_URL);

async function migrate() {
  await client.connect();
  const db = client.db();
  const collection = db.collection('posts_conversations_facebooks');

  const selector = { timestamp: { $lt: EPOCH_SECONDS_CUTOFF } };
  const affected = await collection.countDocuments(selector);

  if (!affected) {
    console.log('No Facebook post timestamps need repairing.');
    return;
  }

  const [preview] = await collection
    .aggregate([
      { $match: selector },
      {
        $project: {
          repaired: {
            $toDate: { $multiply: [{ $toLong: '$timestamp' }, 1000] },
          },
        },
      },
      {
        $group: {
          _id: null,
          min: { $min: '$repaired' },
          max: { $max: '$repaired' },
        },
      },
    ])
    .toArray();

  console.log(
    `${affected} posts would be repaired into ${preview?.min?.toISOString()} .. ${preview?.max?.toISOString()}`,
  );

  if (DRY_RUN) {
    console.log('DRY_RUN=true, nothing written.');
    return;
  }

  const result = await collection.updateMany(selector, [
    {
      $set: {
        timestamp: {
          $toDate: { $multiply: [{ $toLong: '$timestamp' }, 1000] },
        },
      },
    },
  ]);

  console.log(`Repaired ${result.modifiedCount} Facebook post timestamps.`);
}

migrate()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => client.close());
