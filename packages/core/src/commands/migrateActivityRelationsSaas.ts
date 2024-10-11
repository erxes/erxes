import * as dotenv from "dotenv";

dotenv.config();

import { MongoClient } from "mongodb";

import { getOrganizations } from "@erxes/api-utils/src/saas/saas";

const { MONGO_URL = "" } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

let db;

const command = async () => {
  const organizations = await getOrganizations();

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

  for (const org of organizations) {
    try {
      console.log(MONGO_URL, org._id);
      const client = new MongoClient(
        MONGO_URL.replace("<organizationId>", org._id)
      );

      await client.connect();
      db = client.db();

      const Actitivylogs = db.collection("activity_logs");

      try {
        await Actitivylogs.find({}).forEach(doc => {
          const contentType = switchContentType(doc.contentType);

          Actitivylogs.updateOne({ _id: doc._id }, { $set: { contentType } });
        });
      } catch (e) {
        console.log(`Error occurred: ${e.message}`);
      }

      console.log("migrated", org.subdomain);
    } catch (e) {
      console.error(e.message);
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
