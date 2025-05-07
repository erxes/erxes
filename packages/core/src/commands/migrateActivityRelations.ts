import * as dotenv from "dotenv";

dotenv.config();

import { Collection, Db, MongoClient } from "mongodb";

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let ActivityLogs: Collection<any>;

const switchContentType = contentType => {
  let changedContentType = contentType;

  switch (contentType) {
    case "cards:deal":
      changedContentType = `sales:deal`;
      break;
    case "cards:purchase":
      changedContentType = `purchases:purchase`;
      break;
    case "cards:ticket":
      changedContentType = `tickets:ticket`;
      break;
    case "cards:task":
      changedContentType = `tasks:task`;
      break;
    case "growthhacks:growthHack":
      changedContentType = `growthhacks:growthHack`;
      break;

    case "contacts:customer":
      changedContentType = `core:customer`;
      break;

    case "contacts:company":
      changedContentType = `core:company`;
      break;

    case "contacts:lead":
      changedContentType = `core:lead`;
      break;

    case "emailTemplates:emailTemplate":
      changedContentType = `core:emailTemplate`;
      break;

    case "products:product":
      changedContentType = `core:product`;
      break;

    default:
      changedContentType = contentType;
  }

  return changedContentType;
};

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  ActivityLogs = db.collection("activity_logs");
  const limit = 1000;

  console.debug(`Logs migrated ....`);

  const bulkOps = [] as any[];

  const activitySummary = await ActivityLogs.find({}).count();

  for (let skip = 0; skip <= activitySummary; skip = skip + limit) {
    const logs = await ActivityLogs.find({}).skip(skip).limit(limit).toArray();
    for (const log of logs) {
      const contentType = switchContentType(log.contentType);
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

  console.debug(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
