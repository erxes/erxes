import { generateModels } from "./connectionResolver";
import { customerToDynamic } from "./utilsCustomer";
import { dealToDynamic } from "./utils";

const allowTypes = {
  "core:customer": ["create"],
  "core:company": ["create"],
  "pos:order": ["synced"]
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, user } = params;

  const models = await generateModels(subdomain);

  const syncLogDoc = {
    type: "",
    contentType: type,
    contentId: params.object?._id,
    createdAt: new Date(),
    createdBy: user?._id,
    consumeData: params,
    consumeStr: JSON.stringify(params)
  };

  let syncLog;

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  try {
    if (type === "core:customer" && action === "create") {
      await customerToDynamic(subdomain, params.object, models);
      return;
    }

    if (type === "core:company" && action === "create") {
      await customerToDynamic(subdomain, params.object, models);
      return;
    }

    if (type === "pos:order") {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

      if (action === "synced") {
        await dealToDynamic(subdomain, syncLog, params.updatedDocument || params.object, models);
        return;
      }
    }
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } }
    );
  }
};

export default allowTypes;
