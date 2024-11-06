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

      const migrateItems = async (
        contentType,
        collection,
        targetCollection
      ) => {
        try {
          const DB_COLLECTION = db.collection(collection);

          let TARGET_COLLECTION = db.collection(targetCollection);

          try {
            await TARGET_COLLECTION.drop();
          } catch (e) {
            console.log(e.message, contentType);
          }

          TARGET_COLLECTION = db.collection(targetCollection);

          if (contentType) {
            await DB_COLLECTION.find({ type: contentType }).forEach(item => {
              try {
                TARGET_COLLECTION.insertOne(item);
              } catch (e) {
                console.log(e);
              }
            });
          } else {
            await DB_COLLECTION.find().forEach(item => {
              try {
                TARGET_COLLECTION.insertOne(item);
              } catch (e) {
                console.log(e);
              }
            });
          }
        } catch (e) {
          console.log(e.message, contentType);
        }
      };

      // console.log("migrating boards");

      // await migrateItems("deal", "boards", "sales_boards");
      // await migrateItems("task", "boards", "tasks_boards");
      // await migrateItems("purchase", "boards", "purchases_boards");
      // await migrateItems("ticket", "boards", "tickets_boards");
      // await migrateItems("growthhacks", "boards", "growthhacks_boards");

      // console.log(`migrating boards finished at: ${new Date()}`);

      // console.log("migrating pipelines");

      // await migrateItems("deal", "pipelines", "sales_pipelines");
      // await migrateItems("task", "pipelines", "tasks_pipelines");
      // await migrateItems("purchase", "pipelines", "purchases_pipelines");
      // await migrateItems("ticket", "pipelines", "tickets_pipelines");
      // await migrateItems("growthhacks", "pipelines", "growthhacks_pipelines");

      console.log(`migrating pipelines finished at: ${new Date()}`);

      console.log("migrating pipeline_labels");

      await migrateItems(null, "pipeline_labels", "sales_pipeline_labels");
      await migrateItems(null, "pipeline_labels", "tasks_pipeline_labels");
      await migrateItems(null, "pipeline_labels", "purchases_pipeline_labels");
      await migrateItems(null, "pipeline_labels", "tickets_pipeline_labels");
      await migrateItems(
        null,
        "pipeline_labels",
        "growthhacks_pipeline_labels"
      );

      console.log(`migrating pipeline_labels finished at: ${new Date()}`);

      // console.log("migrating stages");

      // await migrateItems("deal", "stages", "sales_stages");
      // await migrateItems("task", "stages", "tasks_stages");
      // await migrateItems("purchase", "stages", "purchases_stages");
      // await migrateItems("ticket", "stages", "tickets_stages");
      // await migrateItems("growthhacks", "stages", "growthhacks_stages");

      // console.log(`migrating stages finished at: ${new Date()}`);

      // console.log("migrating checklists");

      // await migrateItems("deal", "checklists", "sales_checklists");
      // await migrateItems("task", "checklists", "tasks_checklists");
      // await migrateItems("purchase", "checklists", "purchases_checklists");
      // await migrateItems("ticket", "checklists", "tickets_checklists");
      // await migrateItems("growthhacks", "checklists", "growthhacks_checklists");

      // console.log(`migrating checklists finished at: ${new Date()}`);

      // const ChecklistItems = db.collection("checklist_items");
      // const Checklists = db.collection("checklists");
      // const Deal_ChecklistItems = db.collection("deal_checklist_items");
      // const Task_ChecklistItems = db.collection("task_checklist_items");
      // const Ticket_ChecklistItems = db.collection("ticket_checklist_items");
      // const Purchase_ChecklistItems = db.collection("purchase_checklist_items");
      // const GH_ChecklistItems = db.collection("growthhack_checklist_items");

      // const checklistItemsArray = await ChecklistItems.find().toArray();

      // for (const item of checklistItemsArray) {
      //   // Find the corresponding checklist document
      //   const checklist = await Checklists.findOne({
      //     _id: item.checklistId
      //   });

      //   if (checklist) {
      //     const contentType = checklist.contentType;

      //     if (contentType === "deal") {
      //       await Deal_ChecklistItems.insertOne(item);
      //     }

      //     if (contentType === "task") {
      //       await Task_ChecklistItems.insertOne(item);
      //     }

      //     if (contentType === "ticket") {
      //       await Ticket_ChecklistItems.insertOne(item);
      //     }

      //     if (contentType === "purchase") {
      //       await Purchase_ChecklistItems.insertOne(item);
      //     }

      //     if (contentType === "growthHack") {
      //       await GH_ChecklistItems.insertOne(item);
      //     }
      //   }
      // }

      console.log("migrated", org.subdomain);
    } catch (e) {
      console.error(e.message);
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
