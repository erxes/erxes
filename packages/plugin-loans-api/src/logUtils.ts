import { getSchemaLabels, putActivityLog } from "@erxes/api-utils/src/logUtils";

import { contractSchema } from "./models/definitions/contracts";
import { transactionSchema } from "./models/definitions/transactions";
import { classificationSchema } from "./models/definitions/classification";
import { periodLockSchema } from "./models/definitions/periodLocks";
import { contractTypeSchema } from "./models/definitions/contractTypes";

import { putCreateLog, putDeleteLog, putUpdateLog } from "@erxes/api-utils/src";
import * as _ from "underscore";

const gatherContractFieldNames = async (_models, _doc, prevList = null) => {
  let options = [];

  if (prevList) {
    options = prevList;
  }

  return options;
};

interface IParams {
  action?: string;
  type: string;
  object: any;
  extraParams: any;
}

export const gatherDescriptions = async (params: IParams) => {
  const { action, object, type, extraParams } = params;
  const { models } = extraParams;

  let extraDesc = [];
  let description = "";

  switch (type) {
    case "contract": {
      description = `${object.number} has been ${action}d`;

      extraDesc = await gatherContractFieldNames(models, object);
      break;
    }

    case "collateral": {
      description = `${object.code} has been ${action}d`;

      extraDesc = await gatherContractFieldNames(models, object);
      break;
    }
    default:
      break;
  }
  return { extraDesc, description };
};

export async function createLog(subdomain, user, logData) {
  const descriptions = await gatherDescriptions(logData);

  await putActivityLog(subdomain, {
    ...logData,
    ...descriptions,
    type: `loans:${logData.type}`,
    activityType: `loans:${logData.type}`,
    contentType: `loans:contract`,
    contentId: logData.object?._id
  });

  await putCreateLog(
    subdomain,
    {
      ...logData,
      ...descriptions,
      type: `loans:${logData.type}`
    },
    user
  );
}

export const prepareCocLogData = coc => {
  // condition logic was in ActivityLogs model before
  let action = "create";
  let content: string[] = [];

  if (coc.mergedIds && coc.mergedIds.length > 0) {
    action = "merge";
    content = coc.mergedIds;
  }

  return {
    createdBy: coc.ownerId || coc.integrationId,
    action,
    content,
    contentId: coc._id
  };
};

export async function activityLog(subdomain, logData) {
  const { data } = logData;

  const updatedParams = {
    ...logData,
    subdomain,
    data: { ...data, contentType: `core:${data.contentType}` }
  };
  await putActivityLog(subdomain, updatedParams);
}

export async function updateLog(subdomain, user, logData) {
  const descriptions = gatherDescriptions(logData);

  await putUpdateLog(
    subdomain,
    {
      ...logData,
      ...descriptions,
      type: `loans:${logData.type}`
    },
    user
  );
}

export async function deleteLog(subdomain, user, logData) {
  const descriptions = gatherDescriptions(logData);
  await putDeleteLog(
    subdomain,
    { ...logData, ...descriptions, type: `loans:${logData.type}` },
    user
  );
}

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: "success",
    data: getSchemaLabels(type, [
      { name: "contract", schemas: [contractSchema] },
      { name: "transaction", schemas: [transactionSchema] },
      { name: "classification", schemas: [classificationSchema] },
      { name: "periodLock", schemas: [periodLockSchema] },
      { name: "contractType", schemas: [contractTypeSchema] }
    ])
  })
};
