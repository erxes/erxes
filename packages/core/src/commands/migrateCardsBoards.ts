import * as dotenv from "dotenv";

dotenv.config();

import { Collection, Db, MongoClient } from "mongodb";

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  const migrateItems = async (contentType, collection, targetCollection) => {
    try {
      console.log(123121);
      const DB_COLLECTION = db.collection(collection);

      let TARGET_COLLECTION = db.collection(targetCollection);

      try {
        await TARGET_COLLECTION.drop();
      } catch (e) {
        console.log(e.message, contentType);
      }

      TARGET_COLLECTION = db.collection(targetCollection);

      await DB_COLLECTION.find({ type: contentType }).forEach(item => {
        try {
          TARGET_COLLECTION.insertOne(item);
        } catch (e) {
          console.log(e);
        }
      });
    } catch (e) {
      console.log(e.message, contentType);
    }
  };

  console.log("migrating boards");

  await migrateItems("deal", "boards", "sales_boards");
  await migrateItems("task", "boards", "tasks_boards");
  await migrateItems("purchase", "boards", "purchases_boards");
  await migrateItems("ticket", "boards", "tickets_boards");
  await migrateItems("growthhacks", "boards", "growthhacks_boards");

  console.log(`migrating boards finished at: ${new Date()}`);

  console.log("migrating pipelines");

  await migrateItems("deal", "pipelines", "sales_pipelines");
  await migrateItems("task", "pipelines", "tasks_pipelines");
  await migrateItems("purchase", "pipelines", "purchases_pipelines");
  await migrateItems("ticket", "pipelines", "tickets_pipelines");
  await migrateItems("growthhacks", "pipelines", "growthhacks_pipelines");

  console.log(`migrating pipelines finished at: ${new Date()}`);

  console.log("migrating pipeline_labels");

  await migrateItems("deal", "pipeline_labels", "sales_pipeline_labels");
  await migrateItems("task", "pipeline_labels", "tasks_pipeline_labels");
  await migrateItems(
    "purchase",
    "pipeline_labels",
    "purchases_pipeline_labels"
  );
  await migrateItems("ticket", "pipeline_labels", "tickets_pipeline_labels");
  await migrateItems(
    "growthhacks",
    "pipeline_labels",
    "growthhacks_pipeline_labels"
  );

  console.log(`migrating pipeline_labels finished at: ${new Date()}`);

  console.log("migrating stages");

  await migrateItems("deal", "stages", "sales_stages");
  await migrateItems("task", "stages", "tasks_stages");
  await migrateItems("purchase", "stages", "purchases_stages");
  await migrateItems("ticket", "stages", "tickets_stages");
  await migrateItems("growthhacks", "stages", "growthhacks_stages");

  console.log(`migrating stages finished at: ${new Date()}`);

  console.log("migrating checklists");

  await migrateItems("deal", "checklists", "sales_checklists");
  await migrateItems("task", "checklists", "tasks_checklists");
  await migrateItems("purchase", "checklists", "purchases_checklists");
  await migrateItems("ticket", "checklists", "tickets_checklists");
  await migrateItems("growthhacks", "checklists", "growthhacks_checklists");

  console.log(`migrating checklists finished at: ${new Date()}`);

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
