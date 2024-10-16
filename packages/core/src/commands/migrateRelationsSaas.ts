import * as dotenv from "dotenv";

dotenv.config();

import { MongoClient } from "mongodb";

import { getOrganizationsByFilter } from "@erxes/api-utils/src/saas/saas";

const { MONGO_URL = "" } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

let db;

const command = async () => {
  const organizations = await getOrganizationsByFilter({
    subdomain: {
      $in: [
        "tavanbogd",
        "tbc",
        "gomongolia",
        "juulchin",
        "ubprint",
        "tbs",
        "godiva"
      ]
    }
  });

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

      case "products:product":
        changedContentType = `core:product`;
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

      const Segments = db.collection("segments");
      const Fields = db.collection("form_fields");
      const FieldGroups = db.collection("fields_groups");
      const Tags = db.collection("tags");
      const InternalNotes = db.collection("internal_notes");
      const Webhooks = db.collection("webhooks");
      const Charts = db.collection("insight_charts");
      const Reports = db.collection("reports");
      // const Logs = db.collection("logs");

      try {
        await Segments.find({}).forEach(doc => {
          const contentType = switchContentType(doc.contentType);

          Segments.updateOne({ _id: doc._id }, { $set: { contentType } });

          const updatedConditions: any = [];

          for (const condition of doc.conditions || []) {
            if (condition.propertyType) {
              condition.propertyType = switchContentType(
                condition.propertyType
              );
            }

            updatedConditions.push(condition);
          }

          Segments.updateOne(
            { _id: doc._id },
            { $set: { conditions: updatedConditions } }
          );
        });

        await FieldGroups.find({
          name: { $ne: ["Basic information", "Relations"] }
        }).forEach(doc => {
          const contentType = switchContentType(doc.contentType);

          FieldGroups.updateOne({ _id: doc._id }, { $set: { contentType } });
        });

        console.log("migrating fields");

        await Fields.find({}).forEach(doc => {
          const contentType = switchContentType(doc.contentType);

          Fields.updateOne({ _id: doc._id }, { $set: { contentType } });
        });

        console.log("migrating tags");

        await Tags.find({}).forEach(doc => {
          const contentType = switchContentType(doc.type);

          Tags.updateOne({ _id: doc._id }, { $set: { type: contentType } });
        });

        console.log("migrating internal notes");

        await InternalNotes.find({}).forEach(doc => {
          const contentType = switchContentType(doc.contentType);

          InternalNotes.updateOne({ _id: doc._id }, { $set: { contentType } });
        });

        console.log("migrating webhooks");

        await Webhooks.find({}).forEach(webhook => {
          const actions = webhook.actions || [];
          const fixedActions = [] as any;

          for (const action of actions) {
            const type = switchContentType(action.type);

            fixedActions.push({
              ...action,
              type
            });
          }

          Webhooks.updateOne(
            { _id: webhook._id },
            {
              $set: {
                actions: fixedActions
              }
            }
          );
        });

        // console.log("migrating logs");

        // await Logs.find({}).forEach(doc => {
        //   const contentType = switchContentType(doc.contentType);

        //   Logs.updateOne({ _id: doc._id }, { $set: { contentType } });
        // });

        console.log("migrating charts");

        await Charts.updateMany(
          { templateType: { $regex: new RegExp("Deal") } },
          { $set: { serviceName: "sales" } }
        );

        await Charts.updateMany(
          { templateType: { $regex: new RegExp("Ticket") } },
          { $set: { serviceName: "tickets" } }
        );

        await Charts.updateMany(
          { templateType: { $regex: new RegExp("Task") } },
          { $set: { serviceName: "tasks" } }
        );

        await Charts.updateMany(
          { templateType: { $regex: new RegExp("Purchase") } },
          { $set: { serviceName: "purchases" } }
        );

        await Charts.updateMany(
          { contentType: { $regex: new RegExp("^insight:") } },
          [
            {
              $set: {
                contentType: {
                  $replaceOne: {
                    input: "$contentType",
                    find: "insight:",
                    replacement: "core:"
                  }
                }
              }
            }
          ]
        );

        console.log("migrating reports");

        await Reports.updateMany(
          { serviceType: "task" },
          { $set: { serviceName: "tasks" } }
        );

        await Reports.updateMany(
          { serviceType: "ticket" },
          { $set: { serviceName: "tickets" } }
        );

        await Reports.updateMany(
          { serviceType: "deal" },
          { $set: { serviceName: "sales" } }
        );

        await Reports.updateMany(
          { serviceType: "purchase" },
          { $set: { serviceName: "purchases" } }
        );
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
