import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import type { AnyBulkWriteOperation, Collection, Db, Document } from 'mongodb';

dotenv.config();

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  BATCH_SIZE = '500',
  OWNER_TYPE = '',
  OWNER_ID = '',
  FIELD_ID = '',
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

type OwnerType = 'customer' | 'company' | 'user' | 'cpUser';

type ScoreCampaignDocument = {
  _id: string;
  ownerType?: OwnerType;
  fieldId?: string;
};

type ScoreLogDocument = {
  ownerType?: OwnerType;
  ownerId?: string;
  campaignId?: string;
  action?: string;
  changeScore?: number;
};

type OwnerDocument = {
  _id: string;
  erxesCustomerId?: string;
  propertiesData?: Record<string, unknown>;
};

type CampaignGroup = {
  ownerType: OwnerType;
  fieldId: string;
  campaignIds: string[];
};

type OwnerUpdateTarget = {
  collectionName: string;
  ownerId: string;
};

type FlushResult = {
  matchedCount: number;
  modifiedCount: number;
};

const OWNER_COLLECTIONS: Record<Exclude<OwnerType, 'cpUser'>, string> = {
  customer: 'customers',
  company: 'companies',
  user: 'users',
};
const SUPPORTED_OWNER_TYPES: OwnerType[] = [
  'customer',
  'company',
  'user',
  'cpUser',
];

const client = new MongoClient(MONGO_URL);

let db: Db;
let ScoreCampaigns: Collection<ScoreCampaignDocument>;
let ScoreLogs: Collection<ScoreLogDocument>;
let Customers: Collection<OwnerDocument>;
let Companies: Collection<OwnerDocument>;
let Users: Collection<OwnerDocument>;
let CPUsers: Collection<OwnerDocument>;

const batchSize = Math.max(Number(BATCH_SIZE) || 500, 1);
const cpUserCustomerIds = new Map<string, string | null>();

const fixScoreNumber = (value: number, fractionDigits = 4) => {
  const numberValue = Number(value) || 0;
  const multiplier = 10 ** fractionDigits;

  return Math.round((numberValue + Number.EPSILON) * multiplier) / multiplier;
};

const getOwnerCollection = (collectionName: string) => {
  const collections: Record<string, Collection<OwnerDocument>> = {
    customers: Customers,
    companies: Companies,
    users: Users,
  };

  return collections[collectionName];
};

const getOwnerUpdateTarget = async (
  ownerType: OwnerType,
  ownerId: string,
): Promise<OwnerUpdateTarget | null> => {
  if (ownerType !== 'cpUser') {
    return {
      collectionName: OWNER_COLLECTIONS[ownerType],
      ownerId,
    };
  }

  if (!cpUserCustomerIds.has(ownerId)) {
    const cpUser = await CPUsers.findOne(
      { _id: ownerId },
      { projection: { erxesCustomerId: 1 } },
    );

    cpUserCustomerIds.set(ownerId, cpUser?.erxesCustomerId || null);
  }

  const erxesCustomerId = cpUserCustomerIds.get(ownerId);

  if (!erxesCustomerId) {
    return null;
  }

  return {
    collectionName: 'customers',
    ownerId: erxesCustomerId,
  };
};

const getCampaignGroups = async () => {
  const filter: Document = {
    fieldId: { $exists: true, $nin: [null, ''] },
    ownerType: { $in: SUPPORTED_OWNER_TYPES },
  };

  if (OWNER_TYPE) {
    if (!SUPPORTED_OWNER_TYPES.includes(OWNER_TYPE as OwnerType)) {
      throw new Error(`Unsupported OWNER_TYPE: ${OWNER_TYPE}`);
    }

    filter.ownerType = OWNER_TYPE;
  }

  if (FIELD_ID) {
    filter.fieldId = FIELD_ID;
  }

  const campaigns = await ScoreCampaigns.find(filter, {
    projection: { _id: 1, ownerType: 1, fieldId: 1 },
  }).toArray();
  const grouped = new Map<string, CampaignGroup>();

  for (const campaign of campaigns) {
    if (!campaign.ownerType || !campaign.fieldId) {
      continue;
    }

    const key = `${campaign.ownerType}:${campaign.fieldId}`;
    const group = grouped.get(key) || {
      ownerType: campaign.ownerType,
      fieldId: campaign.fieldId,
      campaignIds: [],
    };

    group.campaignIds.push(String(campaign._id));
    grouped.set(key, group);
  }

  return [...grouped.values()];
};

const buildOwnerPropertyUpdate = (
  fieldId: string,
  score: number,
): Document[] => [
  {
    $set: {
      propertiesData: {
        $mergeObjects: [
          { $ifNull: ['$propertiesData', {}] },
          { [fieldId]: score },
        ],
      },
    },
  },
];

const flush = async (
  operations: Map<string, AnyBulkWriteOperation<OwnerDocument>[]>,
): Promise<FlushResult> => {
  let matchedCount = 0;
  let modifiedCount = 0;

  for (const [collectionName, collectionOperations] of operations.entries()) {
    if (!collectionOperations.length) {
      continue;
    }

    const result = await getOwnerCollection(collectionName).bulkWrite(
      collectionOperations,
      { ordered: false },
    );

    matchedCount += result.matchedCount || 0;
    modifiedCount += result.modifiedCount || 0;
  }

  operations.clear();

  return { matchedCount, modifiedCount };
};

const addOperation = (
  operations: Map<string, AnyBulkWriteOperation<OwnerDocument>[]>,
  collectionName: string,
  operation: AnyBulkWriteOperation<OwnerDocument>,
) => {
  operations.set(collectionName, [
    ...(operations.get(collectionName) || []),
    operation,
  ]);
};

const getOperationCount = (
  operations: Map<string, AnyBulkWriteOperation<OwnerDocument>[]>,
) =>
  [...operations.values()].reduce(
    (total, collectionOperations) => total + collectionOperations.length,
    0,
  );

const applyLogToScore = (score: number, log: ScoreLogDocument) => {
  const changeScore = Number(log.changeScore) || 0;

  return log.action === 'set' || log.action === 'return'
    ? changeScore
    : score + changeScore;
};

const hasNonZeroOwnerProperty = (
  owner: OwnerDocument | null,
  fieldId: string,
) =>
  owner?.propertiesData?.[fieldId] !== undefined &&
  Number(owner.propertiesData[fieldId]) !== 0;

const command = async () => {
  await client.connect();
  db = client.db();

  ScoreCampaigns = db.collection<ScoreCampaignDocument>('score_campaigns');
  ScoreLogs = db.collection<ScoreLogDocument>('score_logs');
  Customers = db.collection<OwnerDocument>('customers');
  Companies = db.collection<OwnerDocument>('companies');
  Users = db.collection<OwnerDocument>('users');
  CPUsers = db.collection<OwnerDocument>('client_portal_users');

  console.log(`Process start at: ${new Date().toISOString()}`);
  console.log(`Mode: write, batchSize: ${batchSize}`);
  console.log(
    `Filters: ownerType=${OWNER_TYPE || 'all'}, ownerId=${
      OWNER_ID || 'all'
    }, fieldId=${FIELD_ID || 'all'}`,
  );

  const campaignGroups = await getCampaignGroups();
  const operations = new Map<string, AnyBulkWriteOperation<OwnerDocument>[]>();
  let scannedOwnerCount = 0;
  let preparedCount = 0;
  let matchedCount = 0;
  let modifiedCount = 0;
  let skippedOwnerCount = 0;
  let zeroedOwnerWithoutLogCount = 0;

  console.log(`Campaign field groups: ${campaignGroups.length}`);

  for (const group of campaignGroups) {
    const match: Document = {
      ownerType: group.ownerType,
      campaignId: { $in: group.campaignIds },
      ownerId: { $exists: true, $nin: [null, ''] },
    };

    if (OWNER_ID) {
      match.ownerId = OWNER_ID;
    }

    const cursor = ScoreLogs.find(match)
      .sort({ ownerId: 1, createdAt: 1, _id: 1 })
      .batchSize(batchSize);
    let currentOwnerId = '';
    let currentScore = 0;
    const loggedOwnerIds = new Set<string>();

    const prepareOwnerUpdate = async (ownerId: string, scoreValue: number) => {
      if (!ownerId) {
        skippedOwnerCount++;
        return;
      }

      scannedOwnerCount++;

      const target = await getOwnerUpdateTarget(group.ownerType, ownerId);

      if (!target) {
        skippedOwnerCount++;
        return;
      }

      const score = fixScoreNumber(scoreValue);

      addOperation(operations, target.collectionName, {
        updateOne: {
          filter: { _id: target.ownerId },
          update: buildOwnerPropertyUpdate(group.fieldId, score),
        },
      });

      preparedCount++;

      if (getOperationCount(operations) >= batchSize) {
        const result = await flush(operations);
        matchedCount += result.matchedCount;
        modifiedCount += result.modifiedCount;
        console.log(
          `Prepared ${preparedCount}, matched ${matchedCount}, modified ${modifiedCount}`,
        );
      }
    };

    const prepareOwnersWithoutLogs = async () => {
      if (group.ownerType === 'cpUser') {
        const cpUserMatch: Document = {
          erxesCustomerId: { $exists: true, $nin: [null, ''] },
        };

        if (OWNER_ID) {
          cpUserMatch._id = OWNER_ID;
        }

        const cpUserCursor = CPUsers.find(cpUserMatch, {
          projection: { _id: 1, erxesCustomerId: 1 },
        }).batchSize(batchSize);

        for await (const cpUser of cpUserCursor) {
          const cpUserId = String(cpUser._id || '');

          if (!cpUserId || loggedOwnerIds.has(cpUserId)) {
            continue;
          }

          const customer = await Customers.findOne(
            { _id: cpUser.erxesCustomerId },
            { projection: { propertiesData: 1 } },
          );

          if (!hasNonZeroOwnerProperty(customer, group.fieldId)) {
            continue;
          }

          await prepareOwnerUpdate(cpUserId, 0);
          zeroedOwnerWithoutLogCount++;
        }

        return;
      }

      const ownerCollectionName = OWNER_COLLECTIONS[group.ownerType];
      const ownerMatch: Document = {
        [`propertiesData.${group.fieldId}`]: { $exists: true, $ne: 0 },
      };

      if (OWNER_ID) {
        ownerMatch._id = OWNER_ID;
      }

      const ownerCursor = getOwnerCollection(ownerCollectionName)
        .find(ownerMatch, { projection: { _id: 1 } })
        .batchSize(batchSize);

      for await (const owner of ownerCursor) {
        const ownerId = String(owner._id || '');

        if (!ownerId || loggedOwnerIds.has(ownerId)) {
          continue;
        }

        await prepareOwnerUpdate(ownerId, 0);
        zeroedOwnerWithoutLogCount++;
      }
    };

    for await (const log of cursor) {
      const ownerId = String(log.ownerId || '');

      if (!ownerId) {
        skippedOwnerCount++;
        continue;
      }

      if (currentOwnerId && ownerId !== currentOwnerId) {
        await prepareOwnerUpdate(currentOwnerId, currentScore);
        loggedOwnerIds.add(currentOwnerId);
        currentScore = 0;
      }

      currentOwnerId = ownerId;
      currentScore = applyLogToScore(currentScore, log);
    }

    if (currentOwnerId) {
      await prepareOwnerUpdate(currentOwnerId, currentScore);
      loggedOwnerIds.add(currentOwnerId);
    }

    await prepareOwnersWithoutLogs();
  }

  const result = await flush(operations);
  matchedCount += result.matchedCount;
  modifiedCount += result.modifiedCount;

  console.log(`Scanned owner field balances: ${scannedOwnerCount}`);
  console.log(`Prepared updates: ${preparedCount}`);
  console.log(`Matched owners: ${matchedCount}`);
  console.log(`Modified owners: ${modifiedCount}`);
  console.log(`Zeroed owners without logs: ${zeroedOwnerWithoutLogCount}`);
  console.log(`Skipped owners: ${skippedOwnerCount}`);
  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Correction failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
