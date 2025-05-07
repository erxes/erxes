import * as dotenv from "dotenv";

dotenv.config();

import { Collection, Db, MongoClient } from "mongodb";

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Checklists: Collection<any>;
let ChecklistItems: Collection<any>;
let Deal_ChecklistItems: Collection<any>;
let Task_ChecklistItems: Collection<any>;
let Ticket_ChecklistItems: Collection<any>;
let Purchase_ChecklistItems: Collection<any>;
let GH_ChecklistItems: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  const migrateItems = async (contentType, collection, targetCollection) => {
    try {
      const DB_COLLECTION = db.collection(collection);

      let TARGET_COLLECTION = db.collection(targetCollection);

      try {
        await TARGET_COLLECTION.drop();
      } catch (e) {
        console.error(e.message, contentType);
      }

      TARGET_COLLECTION = db.collection(targetCollection);

      if (contentType) {
        await DB_COLLECTION.find({ type: contentType }).forEach(item => {
          try {
            TARGET_COLLECTION.insertOne(item);
          } catch (e) {
            console.error(e);
          }
        });
      } else {
        await DB_COLLECTION.find().forEach(item => {
          try {
            TARGET_COLLECTION.insertOne(item);
          } catch (e) {
            console.error(e);
          }
        });
      }
    } catch (e) {
      console.error(e.message, contentType);
    }
  };

  console.debug("migrating boards");

  await migrateItems("deal", "boards", "sales_boards");
  await migrateItems("task", "boards", "tasks_boards");
  await migrateItems("purchase", "boards", "purchases_boards");
  await migrateItems("ticket", "boards", "tickets_boards");
  await migrateItems("growthhacks", "boards", "growthhacks_boards");

  console.debug(`migrating boards finished at: ${new Date()}`);

  console.debug("migrating pipelines");

  await migrateItems("deal", "pipelines", "sales_pipelines");
  await migrateItems("task", "pipelines", "tasks_pipelines");
  await migrateItems("purchase", "pipelines", "purchases_pipelines");
  await migrateItems("ticket", "pipelines", "tickets_pipelines");
  await migrateItems("growthhacks", "pipelines", "growthhacks_pipelines");

  console.debug(`migrating pipelines finished at: ${new Date()}`);

  console.debug("migrating pipeline_labels");

  await migrateItems(null, "pipeline_labels", "sales_pipeline_labels");
  await migrateItems(null, "pipeline_labels", "tasks_pipeline_labels");
  await migrateItems(null, "pipeline_labels", "purchases_pipeline_labels");
  await migrateItems(null, "pipeline_labels", "tickets_pipeline_labels");
  await migrateItems(null, "pipeline_labels", "growthhacks_pipeline_labels");

  console.debug(`migrating pipeline_labels finished at: ${new Date()}`);

  console.debug("migrating stages");

  await migrateItems("deal", "stages", "sales_stages");
  await migrateItems("task", "stages", "tasks_stages");
  await migrateItems("purchase", "stages", "purchases_stages");
  await migrateItems("ticket", "stages", "tickets_stages");
  await migrateItems("growthhacks", "stages", "growthhacks_stages");

  console.debug(`migrating stages finished at: ${new Date()}`);

  console.debug("migrating checklists");

  await migrateItems("deal", "checklists", "sales_checklists");
  await migrateItems("task", "checklists", "tasks_checklists");
  await migrateItems("purchase", "checklists", "purchases_checklists");
  await migrateItems("ticket", "checklists", "tickets_checklists");
  await migrateItems("growthhacks", "checklists", "growthhacks_checklists");

  console.debug(`migrating checklists finished at: ${new Date()}`);

  ChecklistItems = db.collection("checklist_items");
  Checklists = db.collection("checklists");
  Deal_ChecklistItems = db.collection("deal_checklist_items");
  Task_ChecklistItems = db.collection("task_checklist_items");
  Ticket_ChecklistItems = db.collection("ticket_checklist_items");
  Purchase_ChecklistItems = db.collection("purchase_checklist_items");
  GH_ChecklistItems = db.collection("growthhack_checklist_items");

  const checklistItemsArray = await ChecklistItems.find().toArray();

  for (const item of checklistItemsArray) {
    // Find the corresponding checklist document
    const checklist = await Checklists.findOne({
      _id: item.checklistId
    });

    if (checklist) {
      const contentType = checklist.contentType;

      if (contentType === "deal") {
        await Deal_ChecklistItems.insertOne(item);
      }

      if (contentType === "task") {
        await Task_ChecklistItems.insertOne(item);
      }

      if (contentType === "ticket") {
        await Ticket_ChecklistItems.insertOne(item);
      }

      if (contentType === "purchase") {
        await Purchase_ChecklistItems.insertOne(item);
      }

      if (contentType === "growthHack") {
        await GH_ChecklistItems.insertOne(item);
      }
    }
  }

  console.debug(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
