import { getOrganizations } from "@erxes/api-utils/src/saas/saas";
import * as dotenv from "dotenv";

dotenv.config();

import { Collection, Db, MongoClient } from "mongodb";

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Automations: Collection<any>;
let Executions: Collection<any>;

const switchContentType = contentType => {
  let changedContentType = contentType;

  switch (contentType) {
    case "cards:deal":
      changedContentType = "sales:deal";
      break;
    case "cards:purchase":
      changedContentType = "purchases:purchase";
      break;
    case "cards:ticket":
      changedContentType = "tickets:ticket";
      break;
    case "cards:task":
      changedContentType = "tasks:task";
      break;
    case "growthhacks:growthHack":
      changedContentType = "growthhacks:growthHack";
      break;

    case "contacts:customer":
      changedContentType = "core:customer";
      break;

    case "contacts:company":
      changedContentType = "core:company";
      break;

    case "contacts:lead":
      changedContentType = "core:lead";
      break;

    case "products:product":
      changedContentType = "core:product";
      break;

    case "emailTemplates:emailTemplate":
      changedContentType = "core:emailTemplate";
      break;

    default:
      changedContentType = contentType;
  }

  return changedContentType;
};

const switchTriggerTypeByLabel = label => {
  let changedContentType = "";

  switch (label) {
    case "Team member":
      changedContentType = "core:user";
      break;
    case "Customer":
      changedContentType = "core:customer";
      break;
    case "Lead":
      changedContentType = "core:lead";
      break;
    case "Company":
      changedContentType = "core:company";
      break;
    case "Sales pipeline":
      changedContentType = "sales:deal";
      break;

    case "Facebook Comments":
      changedContentType = "facebook:comments";
      break;
    case "Facebook Ads Message":
      changedContentType = "facebook:ads";
      break;

    case "Facebook Message":
      changedContentType = "facebook:messages";
      break;

   case "Instagram Comments":
      changedContentType = "instagram:comments";
      break;
    case "Instagram Ads Message":
      changedContentType = "instagram:ads";
      break;

    case "Instagram Message":
      changedContentType = "instagram:messages";
      break;
      
    case "Conversation":
      changedContentType = "inbox:conversation";
      break;

    case "When Knowledgebase article published":
      changedContentType = "knowledgebase:knowledgeBaseArticle";
      break;

    case "Pos order":
      changedContentType = "pos:posOrder";
      break;

    case "Purchase":
      changedContentType = "purchases:purchase";
      break;

    case "Ticket":
      changedContentType = "tickets:ticket";
      break;

    case "Task":
      changedContentType = "tasks:task";
      break;
  }

  return changedContentType;
};

const switchService = service => {
  let changedService = service;

  switch (service) {
    case "cards":
      changedService = "sales";
      break;
    case "cards":
      changedService = "purchases";
      break;
    case "cards":
      changedService = "tickets";
      break;
    case "cards":
      changedService = "tasks";
      break;
    case "cards":
      changedService = "growthhacks";
      break;

    case "contacts":
      changedService = "core";
      break;

    case "products":
      changedService = "core";
      break;

    case "emailTemplates":
      changedService = "core";
      break;

    default:
      changedService = service;
  }

  return changedService;
};

const command = async () => {
  const organizations = await getOrganizations();

  for (const org of organizations) {
    try {
      console.debug(MONGO_URL, org._id);
      const client = new MongoClient(
        MONGO_URL.replace("<organizationId>", org._id)
      );

      await client.connect();
      db = client.db();

      Automations = db.collection("automations");
      Executions = db.collection("automations_Executions");

      try {
        await Automations.find({}).forEach(automation => {
          const triggers = automation.triggers || [];
          const actions = automation.actions || [];

          const fixedActions = [] as any;
          const fixedTriggers = [] as any;

          for (const trigger of triggers) {
            trigger.type = switchTriggerTypeByLabel(trigger.label);

            fixedTriggers.push({
              ...trigger
            });
          }

          for (const action of actions) {
            const { type } = action;
            const [serviceName, collectionType] = type.split(":");

            if (serviceName) {
              action.type = `${switchService(serviceName)}:${collectionType}`;
            }

            const { module } = action.config;

            if (module) {
              const [serviceName, collectionType] = module.split(":");
              action.config.module = `${switchService(serviceName)}:${collectionType}`;
            }

            fixedActions.push({
              ...action
            });
          }

          Automations.updateOne(
            { _id: automation._id },
            {
              $set: {
                triggers: fixedTriggers,
                actions: fixedActions
              }
            }
          );
        });
      } catch (e) {
        console.error(e.message);
      }

      try {
        await Executions.find({}).forEach(doc => {
          const triggerType = switchContentType(doc.triggerType);

          Executions.updateOne({ _id: doc._id }, { $set: { triggerType } });
        });

        await Executions.find({}).forEach(execution => {
          const actions = execution.actions || [];
          const fixedActions = [] as any;

          for (const action of actions) {
            const { actionType } = action;
            const [serviceName, collectionType] = actionType.split(":");

            if (actionType) {
              action.actionType = `${switchService(serviceName)}:${collectionType}`;
            }

            fixedActions.push({
              ...action
            });
          }

          Executions.updateOne(
            { _id: execution._id },
            {
              $set: {
                actions: fixedActions
              }
            }
          );
        });
      } catch (e) {
        console.error(e.message);
      }

      console.debug("migrated", org.subdomain);
    } catch (e) {
      console.error(e.message);
    }
  }

  console.debug("Process finished at: ${new Date()}");

  process.exit();
};

command();
