import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { LOGS_MONGO_URL } = process.env;

if (!LOGS_MONGO_URL) {
  throw new Error(`Environment variable LOGS_MONGO_URL not set.`);
}

const client = new MongoClient(LOGS_MONGO_URL);

let db: Db;

let Logs: Collection<any>;
let ActivityLogs: Collection<any>;

const changeType = type => {
  let prefix = '';

  switch (type) {
    case 'board':
    case 'task':
    case 'taskBoards':
    case 'taskPipelines':
    case 'ticket':
    case 'ticketBoards':
    case 'ticketPipelines':
    case 'ticketStages':
    case 'deal':
    case 'dealBoards':
    case 'dealPipelines':
    case 'purchase':
    case 'purchaseBoards':
    case 'purchasePipelines':
    case 'checkListItem':
      prefix = 'cards';
    case 'checklist':
      prefix = 'cards';
    case 'dealStages':
    case 'purchaseStages':
    case 'growthHack':
    case 'growthHackBoards':
    case 'growthHackPipelines':
    case 'pipelineLabel':
    case 'pipelineTemplate':
      prefix = 'cards';
      break;

    case 'product':
    case 'productCategory':
      prefix = 'products';
      break;

    case 'knowledgeBaseArticle':
    case 'knowledgeBaseCategory':
    case 'knowledgeBaseTopic':
      prefix = 'knowledgebase';
      break;

    case 'internalNote':
      prefix = 'internalnotes';
      break;

    case 'tag':
      prefix = 'tags';
      break;

    case 'customer':
    case 'company':
      prefix = 'contacts';
      break;

    case 'channel':
    case 'conversation':
    case 'integration':
      prefix = 'inbox';
      break;

    case 'segment':
      prefix = 'segments';
      break;
    case 'permission':
    case 'user':
    case 'brand':
      prefix = 'core';
      break;
    case 'engage':
      prefix = 'engages';
      break;
    default:
      break;
  }

  if (!prefix) {
    return type;
  }

  return `${prefix}:${type}`;
};

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Logs = db.collection('logs');
  ActivityLogs = db.collection('activity_logs');
  const limit = 1000;

  const logsSummary = await Logs.find({}).count();

  let bulkOps: any[] = [];

  for (let skip = 0; skip <= logsSummary; skip = skip + limit) {
    const logs = await Logs.find({})
      .skip(skip)
      .limit(limit)
      .toArray();
    for (const log of logs) {
      const contentType = changeType(log.contentType);
      if (contentType === log.contentType) {
        continue;
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: log._id },
          update: { $set: { contentType } }
        }
      });
    }

    if (bulkOps.length) {
      await Logs.bulkWrite(bulkOps);
    }
  }

  if (bulkOps.length) {
    await Logs.bulkWrite(bulkOps);
  }

  console.log(`Logs migrated ....`);

  bulkOps = [];

  const activitySummary = await ActivityLogs.find({}).count();

  for (let skip = 0; skip <= activitySummary; skip = skip + limit) {
    const logs = await ActivityLogs.find({})
      .skip(skip)
      .limit(limit)
      .toArray();
    for (const log of logs) {
      const contentType = changeType(log.contentType);
      if (contentType === log.contentType) {
        continue;
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: log._id },
          update: { $set: { contentType } }
        }
      });
    }

    if (bulkOps.length) {
      await ActivityLogs.bulkWrite(bulkOps);
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
