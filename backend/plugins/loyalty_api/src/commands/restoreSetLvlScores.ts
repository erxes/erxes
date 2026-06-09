import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import type { AnyBulkWriteOperation, Collection, Db } from 'mongodb';

dotenv.config();

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  BATCH_SIZE = '1000',
  SET_CAMPAIGN_ID = 'hHWLdArSP0hYISPOaCUL2',
  ADD_CAMPAIGN_IDS = 'f8R79D_Cd8NCU-5TE7Iz3, x2ZNNAt3SHA1gFgOGg2UZ',
  OWNER_TYPE = 'customer',
  OWNER_ID = '',
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

type ScoreCampaignDocument = {
  _id: string;
  title?: string;
  ownerType?: string;
  fieldId?: string;
  set?: { placeholder?: string; currencyRatio?: string };
};

type ScoreLogDocument = {
  _id: string;
  ownerType?: string;
  ownerId?: string;
  campaignId?: string;
  action?: string;
  preScore?: number;
  changeScore?: number;
  targetId?: string;
  serviceName?: string;
  description?: string;
  createdAt?: Date;
  createdBy?: string;
};

type TargetDocument = {
  _id: string;
  totalAmount?: number;
  finalAmount?: number;
  productsData?: Array<{
    amount?: number;
    quantity?: number;
    unitPrice?: number;
  }>;
  items?: Array<{ amount?: number; quantity?: number; unitPrice?: number }>;
};

const client = new MongoClient(MONGO_URL);

let db: Db;
let ScoreCampaigns: Collection<ScoreCampaignDocument>;
let ScoreLogs: Collection<ScoreLogDocument>;
let Deals: Collection<TargetDocument>;
let PosOrders: Collection<TargetDocument>;

const batchSize = Math.max(Number(BATCH_SIZE) || 1000, 1);
const addCampaignIds = ADD_CAMPAIGN_IDS.split(',')
  .map((campaignId) => campaignId.trim())
  .filter(Boolean);
const RESTORE_DESCRIPTION =
  'Restore set level score log from legacy automation';
const VALID_LEVELS = [0, 3, 5, 10];

const fixScoreNumber = (value: number, fractionDigits = 4) => {
  const numberValue = Number(value) || 0;
  const multiplier = 10 ** fractionDigits;

  return Math.round((numberValue + Number.EPSILON) * multiplier) / multiplier;
};

const generateTargetTotalAmount = (
  productsData: TargetDocument['productsData'],
) =>
  (productsData || []).reduce(
    (sum, product) =>
      sum +
      (Number(product?.amount) ||
        Number(product?.unitPrice) * (Number(product?.quantity) || 1) ||
        0),
    0,
  );

const getTargetTotalAmount = async (log: ScoreLogDocument) => {
  if (!log.targetId) {
    return 0;
  }

  if (log.serviceName === 'pos') {
    const order = await PosOrders.findOne({ _id: log.targetId });

    return (
      Number(order?.totalAmount) ||
      Number(order?.finalAmount) ||
      generateTargetTotalAmount(order?.items) ||
      0
    );
  }

  const deal = await Deals.findOne({ _id: log.targetId });

  return (
    Number(deal?.totalAmount) ||
    Number(deal?.finalAmount) ||
    generateTargetTotalAmount(deal?.productsData) ||
    0
  );
};

const getFormulaLevel = (totalAmount: number, currentLevel: number) => {
  if (totalAmount >= 1500000 || currentLevel === 10) {
    return 10;
  }

  if (totalAmount >= 1000000 || currentLevel === 5) {
    return 5;
  }

  if (totalAmount >= 500000 || currentLevel === 3) {
    return 3;
  }

  return 0;
};

const getSetCampaign = async () => {
  if (!SET_CAMPAIGN_ID) {
    throw new Error('Set SET_CAMPAIGN_ID explicitly.');
  }

  const campaign = await ScoreCampaigns.findOne({ _id: SET_CAMPAIGN_ID });

  if (!campaign) {
    throw new Error(`Set score campaign not found: ${SET_CAMPAIGN_ID}`);
  }

  return campaign;
};

const getExistingSetLog = async ({
  ownerId,
  ownerType,
  targetId,
  campaignId,
}: {
  ownerId?: string;
  ownerType: string;
  targetId?: string;
  campaignId: string;
}) =>
  ScoreLogs.findOne({
    ownerType,
    ownerId,
    targetId,
    campaignId,
    action: 'set',
  });

const getRelatedAddLog = async ({
  ownerId,
  ownerType,
  targetId,
  setCampaignId,
}: {
  ownerId?: string;
  ownerType: string;
  targetId?: string;
  setCampaignId: string;
}) => {
  if (!ownerId || !targetId) {
    return null;
  }

  const filter: Record<string, unknown> = {
    ownerType,
    ownerId,
    targetId,
    action: 'add',
  };

  if (addCampaignIds.length) {
    filter.campaignId = { $in: addCampaignIds };
  } else {
    filter.campaignId = { $ne: setCampaignId };
  }

  return ScoreLogs.findOne(filter, { projection: { _id: 1 } });
};

const getLastRestoredLevel = async ({
  ownerId,
  ownerType,
  campaignId,
}: {
  ownerId: string;
  ownerType: string;
  campaignId: string;
}) => {
  const lastLog = await ScoreLogs.find({
    ownerType,
    ownerId,
    campaignId,
    action: { $in: ['set', 'return'] },
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(1)
    .next();

  return Number(lastLog?.changeScore) || 0;
};

const flush = async (operations: AnyBulkWriteOperation<ScoreLogDocument>[]) => {
  if (!operations.length) {
    return { insertedCount: 0, modifiedCount: 0, deletedCount: 0 };
  }

  const result = await ScoreLogs.bulkWrite(operations, { ordered: false });

  operations.length = 0;

  return {
    insertedCount: result.insertedCount || 0,
    modifiedCount: result.modifiedCount || 0,
    deletedCount: result.deletedCount || 0,
  };
};

const cleanupInvalidSetLogs = async ({
  ownerType,
  setCampaignId,
}: {
  ownerType: string;
  setCampaignId: string;
}) => {
  const filter: Record<string, unknown> = {
    ownerType,
    campaignId: setCampaignId,
    action: 'set',
    $or: [
      { description: RESTORE_DESCRIPTION },
      { changeScore: { $nin: VALID_LEVELS } },
    ],
  };

  if (OWNER_ID) {
    filter.ownerId = OWNER_ID;
  }

  const cursor = ScoreLogs.find(filter).batchSize(batchSize);
  const operations: AnyBulkWriteOperation<ScoreLogDocument>[] = [];
  let scannedCount = 0;
  let deletedCount = 0;
  let skippedInvalidWithAddCount = 0;

  for await (const setLog of cursor) {
    scannedCount++;

    const isRestoredLog = setLog.description === RESTORE_DESCRIPTION;
    const hasInvalidLevel = !VALID_LEVELS.includes(
      fixScoreNumber(Number(setLog.changeScore)),
    );
    const relatedAddLog = await getRelatedAddLog({
      ownerId: setLog.ownerId,
      ownerType,
      targetId: setLog.targetId,
      setCampaignId,
    });

    if (!isRestoredLog && hasInvalidLevel && relatedAddLog) {
      skippedInvalidWithAddCount++;
      continue;
    }

    operations.push({
      deleteOne: {
        filter: { _id: setLog._id },
      },
    });

    if (operations.length >= batchSize) {
      const result = await flush(operations);
      deletedCount += result.deletedCount;
      console.log(
        `Cleanup scanned ${scannedCount}, deleted ${deletedCount}, skipped invalid with add ${skippedInvalidWithAddCount}`,
      );
    }
  }

  const result = await flush(operations);
  deletedCount += result.deletedCount;

  return {
    scannedCount,
    deletedCount,
    skippedInvalidWithAddCount,
  };
};

const command = async () => {
  await client.connect();
  db = client.db();

  ScoreCampaigns = db.collection<ScoreCampaignDocument>('score_campaigns');
  ScoreLogs = db.collection<ScoreLogDocument>('score_logs');
  Deals = db.collection<TargetDocument>('deals');
  PosOrders = db.collection<TargetDocument>('pos_orders');

  const setCampaign = await getSetCampaign();
  const ownerType = setCampaign.ownerType || OWNER_TYPE;
  const addLogFilter: Record<string, unknown> = {
    ownerType,
    action: 'add',
    ownerId: { $exists: true, $nin: [null, ''] },
    targetId: { $exists: true, $nin: [null, ''] },
  };

  if (OWNER_ID) {
    addLogFilter.ownerId = OWNER_ID;
  }

  if (addCampaignIds.length) {
    addLogFilter.campaignId = { $in: addCampaignIds };
  } else {
    addLogFilter.campaignId = { $ne: setCampaign._id };
  }

  console.log(`Process start at: ${new Date().toISOString()}`);
  console.log(
    `Mode: write, batchSize=${batchSize}, ownerType=${ownerType}, fieldId=${
      setCampaign.fieldId || ''
    }, setCampaignId=${setCampaign._id}`,
  );

  const cleanup = await cleanupInvalidSetLogs({
    ownerType,
    setCampaignId: setCampaign._id,
  });

  const cursor = ScoreLogs.find(addLogFilter)
    .sort({ ownerId: 1, createdAt: 1, _id: 1 })
    .batchSize(batchSize);
  const ownerLevels = new Map<string, number>();
  const operations: AnyBulkWriteOperation<ScoreLogDocument>[] = [];
  let scannedCount = 0;
  let preparedCount = 0;
  let insertedCount = 0;
  let modifiedCount = 0;
  let skippedExistingCount = 0;
  let skippedNoTargetAmountCount = 0;
  let skippedNoLevelChangeCount = 0;

  for await (const addLog of cursor) {
    scannedCount++;

    if (!addLog.ownerId) {
      continue;
    }

    const totalAmount = await getTargetTotalAmount(addLog);

    if (!totalAmount) {
      skippedNoTargetAmountCount++;
      continue;
    }

    const currentLevel =
      ownerLevels.get(addLog.ownerId) ??
      (await getLastRestoredLevel({
        ownerId: addLog.ownerId,
        ownerType,
        campaignId: setCampaign._id,
      }));
    const nextLevel = getFormulaLevel(totalAmount, currentLevel);

    ownerLevels.set(addLog.ownerId, nextLevel);

    const existingSetLog = await getExistingSetLog({
      ownerId: addLog.ownerId,
      ownerType,
      targetId: addLog.targetId,
      campaignId: setCampaign._id,
    });

    if (existingSetLog) {
      const expectedPreScore = fixScoreNumber(currentLevel);
      const expectedChangeScore = fixScoreNumber(nextLevel);
      const currentPreScore = fixScoreNumber(Number(existingSetLog.preScore));
      const currentChangeScore = fixScoreNumber(
        Number(existingSetLog.changeScore),
      );

      if (
        currentPreScore !== expectedPreScore ||
        currentChangeScore !== expectedChangeScore
      ) {
        operations.push({
          updateOne: {
            filter: { _id: existingSetLog._id },
            update: {
              $set: {
                preScore: expectedPreScore,
                changeScore: expectedChangeScore,
                description: RESTORE_DESCRIPTION,
              },
            },
          },
        });
        preparedCount++;
      } else {
        skippedExistingCount++;
      }

      if (operations.length >= batchSize) {
        const result = await flush(operations);
        insertedCount += result.insertedCount;
        modifiedCount += result.modifiedCount;
        console.log(
          `Scanned ${scannedCount}, prepared ${preparedCount}, inserted ${insertedCount}, modified ${modifiedCount}`,
        );
      }

      continue;
    }

    if (nextLevel === currentLevel) {
      skippedNoLevelChangeCount++;
      continue;
    }

    operations.push({
      insertOne: {
        document: {
          ownerId: addLog.ownerId,
          ownerType,
          campaignId: setCampaign._id,
          preScore: fixScoreNumber(currentLevel),
          changeScore: fixScoreNumber(nextLevel),
          createdAt: addLog.createdAt || new Date(),
          createdBy: addLog.createdBy || '',
          description: RESTORE_DESCRIPTION,
          serviceName: addLog.serviceName,
          targetId: addLog.targetId,
          action: 'set',
        },
      },
    });
    preparedCount++;

    if (operations.length >= batchSize) {
      const result = await flush(operations);
      insertedCount += result.insertedCount;
      modifiedCount += result.modifiedCount;
      console.log(
        `Scanned ${scannedCount}, prepared ${preparedCount}, inserted ${insertedCount}, modified ${modifiedCount}`,
      );
    }
  }

  const result = await flush(operations);
  insertedCount += result.insertedCount;
  modifiedCount += result.modifiedCount;

  console.log(`Scanned add score logs: ${scannedCount}`);
  console.log(`Cleanup scanned set logs: ${cleanup.scannedCount}`);
  console.log(`Cleanup deleted set logs: ${cleanup.deletedCount}`);
  console.log(
    `Cleanup skipped invalid set logs with add: ${cleanup.skippedInvalidWithAddCount}`,
  );
  console.log(`Prepared set logs: ${preparedCount}`);
  console.log(`Inserted set logs: ${insertedCount}`);
  console.log(`Modified set logs: ${modifiedCount}`);
  console.log(`Skipped existing set logs: ${skippedExistingCount}`);
  console.log(`Skipped no target amount: ${skippedNoTargetAmountCount}`);
  console.log(`Skipped no level change: ${skippedNoLevelChangeCount}`);
  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Restore set level score logs failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
