import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  putActivityLog as commonPutActivityLog,
  LogDesc,
  IDescriptions,
  getSchemaLabels
} from '@erxes/api-utils/src/logUtils';
import { IModels, generateModels } from './connectionResolver';

import messageBroker from './messageBroker';
import { ITagDocument, tagSchema } from './models/definitions/tags';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
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
  const { action, object, updatedDocument } = params;

  const description = `"${object.name}" has been ${action}d`;
  let extraDesc: LogDesc[] = await gatherTagNames(models, object);

  if (updatedDocument) {
    extraDesc = await gatherTagNames(models, updatedDocument, extraDesc);
  }

  return { extraDesc, description };
};

export const putDeleteLog = async (models, subdomain, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.DELETE
  });

  await commonPutDeleteLog(
    subdomain,
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `tags:${logDoc.type}` },
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
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `tags:${logDoc.type}` },
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
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `tags:${logDoc.type}` },
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
    data: { ...data, contentType: `tags:${data.contentType}` }
  };

  return commonPutActivityLog(subdomain, {
    messageBroker: messageBroker(),
    ...updatedParams
  });
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, [{ name: 'tag', schemas: [tagSchema] }])
  }),
  getActivityContent: async ({ subdomain, data }) => {
    const { action, content } = data;
    const models = await generateModels(subdomain);

    if (action === 'tagged') {
      let tags: ITagDocument[] = [];

      if (content) {
        tags = await models.Tags.find({ _id: { $in: content.tagIds } });
      }

      return {
        data: tags,
        status: 'success'
      };
    }

    return {
      status: 'error',
      data: 'wrong action'
    };
  }
};
