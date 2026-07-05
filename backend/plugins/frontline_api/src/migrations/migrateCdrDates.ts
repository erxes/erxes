const { MongoClient } = require('mongodb');
import * as dotenv from 'dotenv';
dotenv.config();

const OFFSET_MS = 8 * 60 * 60 * 1000;

const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb://localhost:27017/erxes?directConnection=true';

const CUTOFF = process.env.CUTOFF;

if (!MONGO_URL) {
  throw new Error('MONGO_URL not provided');
}

if (!CUTOFF || isNaN(new Date(CUTOFF).getTime())) {
  throw new Error(
    'CUTOFF (deploy time, e.g. CUTOFF=2026-07-05T12:00:00Z) is required',
  );
}

const client = new MongoClient(MONGO_URL);

const shiftDate = (field: string) => ({
  $cond: [
    { $eq: [{ $type: `$${field}` }, 'date'] },
    { $add: [`$${field}`, -OFFSET_MS] },
    `$${field}`,
  ],
});

async function migrate() {
  await client.connect();
  const db = client.db();

  const result = await db.collection('calls_cdrs').updateMany(
    {
      createdAt: { $lt: new Date(CUTOFF) },
      cdrTzFixed: { $ne: true },
    },
    [
      {
        $set: {
          start: shiftDate('start'),
          answer: shiftDate('answer'),
          end: shiftDate('end'),
          cdrTzFixed: true,
        },
      },
    ],
  );

  console.log(
    `Migration done ✅ matched=${result.matchedCount} modified=${result.modifiedCount}`,
  );
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
