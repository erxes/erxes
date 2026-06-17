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

type NormalizedScoreLog = {
  action?: string;
  changeScore: number;
};

type FlushResult = {
  matchedCount: number;
  modifiedCount: number;
  upsertedCount: number;
};

const client = new MongoClient(MONGO_URL);

let db: Db;
let ScoreLogs: Collection<ScoreLogDocument>;
let RecoveryScoreLogs: Collection<ScoreLogDocument>;

const batchSize = Math.max(Number(BATCH_SIZE) || 1000, 1);

const normalizeScoreLog = (log: ScoreLogDocument): NormalizedScoreLog => {
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

const calculateScoreValueFromLogs = (logs: ScoreLogDocument[]) =>
  logs.reduce((score, log) => {
    const normalized = normalizeScoreLog(log);
    const changeScore = Number(normalized.changeScore) || 0;

    return normalized.action === 'set' || normalized.action === 'return'
      ? changeScore
      : score + changeScore;
  }, 0);

const getScoreValueBeforeLog = async (
  collection: Collection<ScoreLogDocument>,
  sourceLog: ScoreLogDocument,
) => {
  const logs = await collection
    .find({
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

const flush = async (
  operations: AnyBulkWriteOperation<ScoreLogDocument>[],
): Promise<FlushResult> => {
  if (!operations.length) {
    return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
  }

  const result = await ScoreLogs.bulkWrite(operations, { ordered: false });

  operations.length = 0;

  return {
    matchedCount: result.matchedCount || 0,
    modifiedCount: result.modifiedCount || 0,
    upsertedCount: result.upsertedCount || 0,
  };
};

const buildRecoveryOperation = async (
  log: ScoreLogDocument,
): Promise<AnyBulkWriteOperation<ScoreLogDocument>> => {
  const normalized = normalizeScoreLog(log);
  const sourceLog =
    log.action === 'refund' && log.sourceScoreLogId
      ? await RecoveryScoreLogs.findOne({ _id: log.sourceScoreLogId })
      : null;

  if (sourceLog?.action === 'set') {
    normalized.action = 'return';
    normalized.changeScore = await getScoreValueBeforeLog(
      RecoveryScoreLogs,
      sourceLog,
    );
  } else if (sourceLog) {
    normalized.action = 'refund';
    normalized.changeScore = -normalizeScoreLog(sourceLog).changeScore;
  }
  const preScore =
    log.preScore !== undefined
      ? Number(log.preScore) || 0
      : await getScoreValueBeforeLog(RecoveryScoreLogs, log);

  const { _id, ...rest } = log;

  return {
    updateOne: {
      filter: { _id },
      update: {
        $set: {
          ...rest,
          action: normalized.action,
          preScore,
          changeScore: normalized.changeScore,
        },
        $setOnInsert: { _id },
      },
      upsert: true,
    },
  };
};

const recoverFromBackupCollection = async () => {
  const cursor = RecoveryScoreLogs.find({
    _id: { $exists: true },
  }).batchSize(batchSize);
  const operations: AnyBulkWriteOperation<ScoreLogDocument>[] = [];
  let scannedCount = 0;
  let preparedCount = 0;
  let matchedCount = 0;
  let modifiedCount = 0;
  let upsertedCount = 0;

  for await (const log of cursor) {
    scannedCount++;
    operations.push(await buildRecoveryOperation(log));
    preparedCount++;

    if (operations.length >= batchSize) {
      const result = await flush(operations);
      matchedCount += result.matchedCount;
      modifiedCount += result.modifiedCount;
      upsertedCount += result.upsertedCount;
      console.log(
        `Recovered ${scannedCount} backup logs, matched ${matchedCount}, modified ${modifiedCount}, upserted ${upsertedCount}`,
      );
    }
  }

  const result = await flush(operations);
  matchedCount += result.matchedCount;
  modifiedCount += result.modifiedCount;
  upsertedCount += result.upsertedCount;

  return {
    scannedCount,
    preparedCount,
    matchedCount,
    modifiedCount,
    upsertedCount,
  };
};

const getCurrentSuspiciousQuery = () => ({
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
});

const normalizeCurrentOnlyLogs = async () => {
  const cursor = ScoreLogs.find(getCurrentSuspiciousQuery()).batchSize(
    batchSize,
  );
  const operations: AnyBulkWriteOperation<ScoreLogDocument>[] = [];
  let scannedCount = 0;
  let skippedRecoveredCount = 0;
  let preparedCount = 0;
  let matchedCount = 0;
  let modifiedCount = 0;

  for await (const log of cursor) {
    scannedCount++;

    const existsInRecovery = await RecoveryScoreLogs.findOne(
      { _id: log._id },
      { projection: { _id: 1 } },
    );

    if (existsInRecovery) {
      skippedRecoveredCount++;
      continue;
    }

    const normalized = normalizeScoreLog(log);
    const sourceLog =
      log.action === 'refund' && log.sourceScoreLogId
        ? await ScoreLogs.findOne({ _id: log.sourceScoreLogId })
        : null;

    if (sourceLog?.action === 'set') {
      normalized.action = 'return';
      normalized.changeScore = await getScoreValueBeforeLog(
        ScoreLogs,
        sourceLog,
      );
    } else if (sourceLog) {
      normalized.action = 'refund';
      normalized.changeScore = -normalizeScoreLog(sourceLog).changeScore;
    }
    const preScore =
      log.preScore !== undefined
        ? Number(log.preScore) || 0
        : await getScoreValueBeforeLog(ScoreLogs, log);

    operations.push({
      updateOne: {
        filter: { _id: log._id },
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
      matchedCount += result.matchedCount;
      modifiedCount += result.modifiedCount;
      console.log(
        `Normalized ${scannedCount} current logs, matched ${matchedCount}, modified ${modifiedCount}`,
      );
    }
  }

  const result = await flush(operations);
  matchedCount += result.matchedCount;
  modifiedCount += result.modifiedCount;

  return {
    scannedCount,
    skippedRecoveredCount,
    preparedCount,
    matchedCount,
    modifiedCount,
  };
};

const getRemainingInvalidSignCounts = async () => ({
  subtractPositiveCount: await ScoreLogs.countDocuments({
    action: 'subtract',
    changeScore: { $gt: 0 },
  }),
});

const command = async () => {
  await client.connect();
  db = client.db();
  ScoreLogs = db.collection<ScoreLogDocument>('score_logs');
  RecoveryScoreLogs = db.collection<ScoreLogDocument>(
    'score_logs_recovery260526',
  );

  console.log(`Process start at: ${new Date().toISOString()}`);
  console.log(
    `Mode: write, batchSize: ${batchSize}, recoveryCollection: score_logs_recovery260526`,
  );

  const recovered = await recoverFromBackupCollection();
  const normalized = await normalizeCurrentOnlyLogs();
  const remainingInvalidSigns = await getRemainingInvalidSignCounts();

  console.log(`Backup scanned logs: ${recovered.scannedCount}`);
  console.log(`Backup prepared updates: ${recovered.preparedCount}`);
  console.log(`Backup matched current logs: ${recovered.matchedCount}`);
  console.log(`Backup modified current logs: ${recovered.modifiedCount}`);
  console.log(`Backup upserted missing logs: ${recovered.upsertedCount}`);
  console.log(`Current suspicious scanned logs: ${normalized.scannedCount}`);
  console.log(
    `Current suspicious skipped as recovered: ${normalized.skippedRecoveredCount}`,
  );
  console.log(`Current normalized updates: ${normalized.preparedCount}`);
  console.log(`Current normalized matched logs: ${normalized.matchedCount}`);
  console.log(`Current normalized modified logs: ${normalized.modifiedCount}`);
  console.log(
    `Remaining invalid signs: subtractPositive=${remainingInvalidSigns.subtractPositiveCount}`,
  );
  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Recovery failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
