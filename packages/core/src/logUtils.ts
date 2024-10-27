import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  putActivityLog as commonPutActivityLog,
  getSchemaLabels,
  IDescriptions,
  LogDesc
} from "@erxes/api-utils/src/logUtils";

import { MODULE_NAMES } from "./data/constants";
import {
  brandEmailConfigSchema,
  brandSchema
} from "./db/models/definitions/brands";
import {
  permissionSchema,
  userGroupSchema
} from "./db/models/definitions/permissions";
import { IUserDocument, userSchema } from "./db/models/definitions/users";
import { generateModels, IModels } from "./connectionResolver";
import { configSchema } from "./db/models/definitions/configs";
import { emailTemplateSchema } from "./db/models/definitions/emailTemplates";
import { ITagDocument } from "./db/models/definitions/tags";

const LOG_MAPPINGS = [
  {
    name: MODULE_NAMES.BRAND,
    schemas: [brandEmailConfigSchema, brandSchema]
  },
  {
    name: MODULE_NAMES.PERMISSION,
    schemas: [permissionSchema]
  },
  {
    name: MODULE_NAMES.USER_GROUP,
    schemas: [userGroupSchema]
  },
  {
    name: MODULE_NAMES.USER,
    schemas: [userSchema]
  },
  {
    name: MODULE_NAMES.CONFIG,
    schemas: [configSchema]
  },
  {
    name: MODULE_NAMES.EMAIl_TEMPLATE,
    schemas: [emailTemplateSchema]
  }
];

export const LOG_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete"
};

const gatherTagNames = async (
  models: IModels,
  doc: ITagDocument,
  prevList?: LogDesc[]
) => {
  const options: LogDesc[] = prevList ? prevList : [];

  if (doc.parentId) {
    const parent = await models.Tags.findOne({ _id: doc.parentId });

    options.push({ parentId: doc.parentId, name: parent && parent.name });
  }

  if (doc.relatedIds) {
    const children = await models.Tags.find({
      _id: { $in: doc.relatedIds }
    }).lean();

    if (children.length > 0) {
      options.push({
        relatedIds: doc.relatedIds,
        name: children.map(c => c.name)
      });
    }
  }

  return options;
};

const gatherDescriptions = async (
  models: IModels,
  params: any
): Promise<IDescriptions> => {
  const { action, object, updatedDocument, type } = params;

  if (type && type === "tag") {
    const description = `"${object.name}" has been ${action}d`;
    let extraDesc: LogDesc[] = await gatherTagNames(models, object);

    if (updatedDocument) {
      extraDesc = await gatherTagNames(models, updatedDocument, extraDesc);
    }

    return { extraDesc, description };
  }

  return { description: "", extraDesc: [] };
};

export const putDeleteLog = async (models, subdomain, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.DELETE
  });

  await commonPutDeleteLog(
    subdomain,
    { ...logDoc, type: `core:${logDoc.type}`, description, extraDesc },
    user
  );
};

export const putUpdateLog = async (models, subdomain, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.UPDATE
  });

  await commonPutUpdateLog(
    subdomain,
    { ...logDoc, type: `core:${logDoc.type}`, description, extraDesc },
    user
  );
};

export const putCreateLog = async (models, subdomain, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.CREATE
  });

  await commonPutCreateLog(
    subdomain,
    { ...logDoc, type: `core:${logDoc.type}`, description, extraDesc },
    user
  );
};

export const putActivityLog = async (
  subdomain: string,
  params: { action: string; data: any }
) => {
  const { data } = params;

  const updatedParams = {
    ...params,
    data: {
      ...data,
      contentType: `core:${data.contentType}`,
      automations: {
        type: data.contentType
      }
    }
  };

  return commonPutActivityLog(subdomain, {
    ...updatedParams
  });
};

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

export default {
  getActivityContent: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { action, content } = data;

    if (action === "assignee") {
      let addedUsers: IUserDocument[] = [];
      let removedUsers: IUserDocument[] = [];

      if (content) {
        addedUsers = await models.Users.findUsers({
          _id: { $in: content.addedUserIds }
        });

        removedUsers = await models.Users.findUsers({
          _id: { $in: content.removedUserIds }
        });
      }

      return {
        data: { addedUsers, removedUsers },
        status: "success"
      };
    }

    if (action === "tagged") {
      let tags: ITagDocument[] = [];

      if (content) {
        tags = await models.Tags.find({ _id: { $in: content.tagIds } });
      }

      return {
        data: tags,
        status: "success"
      };
    }

    return {
      status: "error",
      data: "wrong activity action"
    };
  },

  collectItems: async ({ }) => {
    return {
      status: "success",
      data: {}
    };
  },

  getSchemaLabels: ({ data: { type } }) => ({
    status: "success",
    data: getSchemaLabels(type, LOG_MAPPINGS)
  })
};
