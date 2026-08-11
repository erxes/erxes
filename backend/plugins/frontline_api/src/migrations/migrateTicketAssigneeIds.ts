const { MongoClient } = require('mongodb');
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb://localhost:27017/erxes?directConnection=true';

if (!MONGO_URL) {
  throw new Error('MONGO_URL not provided');
}

const client = new MongoClient(MONGO_URL);

async function migrate() {
  await client.connect();
  const db = client.db();

  const result = await db
    .collection('frontline_tickets')
    .updateMany({ assigneeIds: { $exists: false } }, [
      {
        $set: {
          assigneeIds: {
            $cond: [{ $ifNull: ['$assigneeId', false] }, ['$assigneeId'], []],
          },
        },
      },
    ]);

  console.log(
    `Migration done ✅ matched=${result.matchedCount} modified=${result.modifiedCount}`,
  );
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
