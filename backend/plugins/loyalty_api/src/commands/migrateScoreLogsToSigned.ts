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

type ScoreLogDocument = {
  _id: string;
  action?: string;
  preScore?: number;
  changeScore?: number;
  ownerType?: string;
  ownerId?: string;
  campaignId?: string;
  sourceScoreLogId?: string;
  createdAt?: Date;
} & Record<string, unknown>;

const client = new MongoClient(MONGO_URL);

let db: Db;
let ScoreLogs: Collection<ScoreLogDocument>;

const batchSize = Math.max(Number(BATCH_SIZE) || 1000, 1);

const normalizeScoreLog = (log: ScoreLogDocument) => {
  const changeScore = Number(log.changeScore) || 0;

  if (log.action === 'subtract') {
    return {
      action: 'subtract',
      changeScore: -Math.abs(changeScore),
    };
  }

  if (log.action === 'add') {
    return {
      action: 'add',
      changeScore,
    };
  }

  return {
    action: log.action,
    changeScore,
  };
};

const flush = async (operations: AnyBulkWriteOperation<ScoreLogDocument>[]) => {
  if (!operations.length) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  return ScoreLogs.bulkWrite(operations, { ordered: false });
};

const getRemainingInvalidSignCounts = async () => ({
  subtractPositiveCount: await ScoreLogs.countDocuments({
    action: 'subtract',
    changeScore: { $gt: 0 },
  }),
});

const calculateScoreValueFromLogs = (logs: ScoreLogDocument[]) =>
  logs.reduce((score, log) => {
    const normalized = normalizeScoreLog(log);
    const changeScore = Number(normalized.changeScore) || 0;

    return normalized.action === 'set' || normalized.action === 'return'
      ? changeScore
      : score + changeScore;
  }, 0);

const getScoreValueBeforeLog = async (sourceLog: ScoreLogDocument) => {
  const logs = await ScoreLogs.find({
    _id: { $ne: sourceLog._id },
    ownerId: sourceLog.ownerId,
    ownerType: sourceLog.ownerType,
    campaignId: sourceLog.campaignId,
    createdAt: { $lt: sourceLog.createdAt },
  })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();

  return calculateScoreValueFromLogs(logs);
};

const command = async () => {
  await client.connect();
  db = client.db();
  ScoreLogs = db.collection<ScoreLogDocument>('score_logs');

  console.log(`Process start at: ${new Date().toISOString()}`);
  console.log(`Mode: write, batchSize: ${batchSize}`);

  const cursor = ScoreLogs.find({
    $or: [
      {
        action: 'subtract',
        changeScore: { $gt: 0 },
      },
      {
        action: { $in: ['add', 'subtract', 'set'] },
        preScore: { $exists: false },
      },
      {
        action: 'refund',
        sourceScoreLogId: { $exists: true, $ne: '' },
      },
    ],
  }).batchSize(batchSize);

  let scannedCount = 0;
  let preparedCount = 0;
  let modifiedCount = 0;
  let addCount = 0;
  let subtractCount = 0;
  let refundCount = 0;
  let setCount = 0;
  let actionChangedCount = 0;
  let operations: AnyBulkWriteOperation<ScoreLogDocument>[] = [];

  for await (const log of cursor) {
    scannedCount++;

    const normalized = normalizeScoreLog(log);
    const sourceLog =
      log.action === 'refund' && log.sourceScoreLogId
        ? await ScoreLogs.findOne({ _id: log.sourceScoreLogId })
        : null;

    if (sourceLog?.action === 'set') {
      normalized.action = 'return';
      normalized.changeScore = await getScoreValueBeforeLog(sourceLog);
    } else if (sourceLog) {
      normalized.action = 'refund';
      normalized.changeScore = -normalizeScoreLog(sourceLog).changeScore;
    }
    const preScore =
      log.preScore !== undefined
        ? Number(log.preScore) || 0
        : await getScoreValueBeforeLog(log);

    if (log.action === 'add') {
      addCount++;
    }

    if (log.action === 'subtract') {
      subtractCount++;
    }

    if (log.action === 'refund') {
      refundCount++;
    }

    if (log.action === 'set') {
      setCount++;
    }

    if (normalized.action !== log.action) {
      actionChangedCount++;
    }

    operations.push({
      updateOne: {
        filter: {
          _id: log._id,
        },
        update: {
          $set: {
            action: normalized.action,
            preScore,
            changeScore: normalized.changeScore,
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
  const remainingInvalidSigns = await getRemainingInvalidSignCounts();

  console.log(`Scanned score logs: ${scannedCount}`);
  console.log(`Prepared updates: ${preparedCount}`);
  console.log(
    `Action counts: add=${addCount}, subtract=${subtractCount}, set=${setCount}, refund=${refundCount}`,
  );
  console.log(`Action changed documents: ${actionChangedCount}`);
  console.log(`Modified documents: ${modifiedCount}`);
  console.log(
    `Remaining invalid signs: subtractPositive=${remainingInvalidSigns.subtractPositiveCount}`,
  );
  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
