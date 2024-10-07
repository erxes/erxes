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

    default:
      changedContentType = contentType;
  }

  return changedContentType;
};

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  ActivityLogs = db.collection("activity_logs");

  try {
    console.log("migratings activity logs");

    await ActivityLogs.find({}).forEach(doc => {
      const contentType = switchContentType(doc.contentType);

      console.log(`Updating ${doc._id} with ${contentType}`);
      try {
        ActivityLogs.updateOne({ _id: doc._id }, { $set: { contentType } });
      } catch (e) {
        console.log(e, "123");
      }
    });

    console.log("migrating tags");
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
