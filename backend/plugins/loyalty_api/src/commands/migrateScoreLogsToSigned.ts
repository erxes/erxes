import * as dotenv from 'dotenv';
import { Collection, Db, MongoClient } from 'mongodb';

dotenv.config();

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  DRY_RUN = 'true',
  BATCH_SIZE = '1000',
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

type ScoreLogDocument = {
  _id: string;
  action?: string;
  changeScore?: number;
  scoreStorageMode?: string;
};

const client = new MongoClient(MONGO_URL);

let db: Db;
let ScoreLogs: Collection<ScoreLogDocument>;

const isDryRun = DRY_RUN !== 'false';
const batchSize = Math.max(Number(BATCH_SIZE) || 1000, 1);

const getSignedChangeScore = (log: ScoreLogDocument) => {
  const changeScore = Number(log.changeScore) || 0;

  if (log.action === 'subtract') {
    return -Math.abs(changeScore);
  }

  if (log.action === 'add') {
    return Math.abs(changeScore);
  }

  return changeScore;
};

const flush = async (operations: any[]) => {
  if (!operations.length) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  if (isDryRun) {
    return {
      matchedCount: operations.length,
      modifiedCount: 0,
    };
  }

  return ScoreLogs.bulkWrite(operations, { ordered: false });
};

const command = async () => {
  await client.connect();
  db = client.db();
  ScoreLogs = db.collection<ScoreLogDocument>('score_logs');

  console.log(`Process start at: ${new Date().toISOString()}`);
  console.log(
    `Mode: ${isDryRun ? 'dry-run' : 'write'}, batchSize: ${batchSize}`,
  );

  const cursor = ScoreLogs.find({
    action: { $in: ['add', 'subtract', 'refund'] },
    scoreStorageMode: { $ne: 'signed' },
  }).batchSize(batchSize);

  let scannedCount = 0;
  let preparedCount = 0;
  let modifiedCount = 0;
  let addCount = 0;
  let subtractCount = 0;
  let refundCount = 0;
  let operations: any[] = [];

  for await (const log of cursor) {
    scannedCount++;

    const signedChangeScore = getSignedChangeScore(log);

    if (log.action === 'add') {
      addCount++;
    }

    if (log.action === 'subtract') {
      subtractCount++;
    }

    if (log.action === 'refund') {
      refundCount++;
    }

    operations.push({
      updateOne: {
        filter: {
          _id: log._id,
          scoreStorageMode: { $ne: 'signed' },
        },
        update: {
          $set: {
            changeScore: signedChangeScore,
            scoreStorageMode: 'signed',
            scoreStorageMigratedAt: new Date(),
          },
        },
      },
    });

    preparedCount++;

    if (operations.length >= batchSize) {
      const result = await flush(operations);
      modifiedCount += result.modifiedCount || 0;
      console.log(
        `Processed ${scannedCount} logs, prepared ${preparedCount}, modified ${modifiedCount}`,
      );
      operations = [];
    }
  }

  const result = await flush(operations);
  modifiedCount += result.modifiedCount || 0;

  console.log(`Scanned score logs: ${scannedCount}`);
  console.log(`Prepared updates: ${preparedCount}`);
  console.log(
    `Action counts: add=${addCount}, subtract=${subtractCount}, refund=${refundCount}`,
  );
  console.log(`Modified documents: ${modifiedCount}`);
  console.log(`Process finished at: ${new Date().toISOString()}`);

  if (isDryRun) {
    console.log(
      'Dry-run complete. Re-run with DRY_RUN=false to write changes.',
    );
  }

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
