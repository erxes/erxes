import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  gatherNames,
  gatherUsernames,
  LogDesc,
  IDescriptions
} from '@erxes/api-utils/src/logUtils';
import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';

import { LOG_MAPPINGS, MODULE_NAMES } from './constants';
import messageBroker, { sendCoreMessage } from './messageBroker';
import {
  IArticleDocument,
  ICategoryDocument,
  ITopicDocument
} from './models/definitions/knowledgebase';
import { IModels } from './connectionResolver';

const findFromCore = async (
  subdomain: string,
  ids: string[],
  collectionName: string
) => {
  return sendCoreMessage({
    subdomain,
    action: `${collectionName}.find`,
    data: {
      query: {
        _id: { $in: ids }
      }
    },
    isRPC: true,
    defaultValue: []
  });
};

const gatherKbTopicFieldNames = async (
  models: IModels,
  subdomain: string,
  doc: ITopicDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherUsernames({
    foreignKey: 'createdBy',
    prevList: options,
    items: await findFromCore(subdomain, [doc.createdBy], 'users')
  });

  if (doc.modifiedBy) {
    options = await gatherUsernames({
      foreignKey: 'modifiedBy',
      prevList: options,
      items: await findFromCore(subdomain, [doc.modifiedBy], 'users')
    });
  }

  if (doc.brandId) {
    options = await gatherNames({
      foreignKey: 'brandId',
      prevList: options,
      nameFields: ['name'],
      items: await findFromCore(subdomain, [doc.brandId], 'brands')
    });
  }

  if (doc.categoryIds && doc.categoryIds.length > 0) {
    // categories are removed alongside
    const categories = await models.KnowledgeBaseCategories.find(
      { _id: { $in: doc.categoryIds } },
      { title: 1 }
    );

    for (const cat of categories) {
      options.push({
        categoryIds: cat._id,
        name: cat.title
      });
    }
  }

  return options;
};

const gatherKbCategoryFieldNames = async (
  models: IModels,
  subdomain: string,
  doc: ICategoryDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  const articles = await models.KnowledgeBaseArticles.find(
    { _id: { $in: doc.articleIds } },
    { title: 1 }
  );

  options = await gatherUsernames({
    foreignKey: 'createdBy',
    prevList: options,
    items: await findFromCore(subdomain, [doc.createdBy], 'users')
  });

  if (doc.modifiedBy) {
    options = await gatherUsernames({
      foreignKey: 'modifiedBy',
      prevList: options,
      items: await findFromCore(subdomain, [doc.modifiedBy], 'users')
    });
  }

  if (articles.length > 0) {
    for (const article of articles) {
      options.push({ articleIds: article._id, name: article.title });
    }
  }

  if (doc.topicId) {
    const topic = await models.KnowledgeBaseTopics.findOne({
      _id: doc.topicId
    });

    if (topic) {
      options.push({ topicId: doc.topicId, name: topic.title });
    }
  }

  return options;
};

const gatherKbArticleFieldNames = async (
  models: IModels,
  subdomain: string,
  doc: IArticleDocument,
  prevList?: LogDesc[]
) => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.createdBy) {
    options = await gatherUsernames({
      foreignKey: 'createdBy',
      prevList,
      items: await findFromCore(subdomain, [doc.createdBy], 'users')
    });
  }

  if (doc.modifiedBy) {
    options = await gatherUsernames({
      foreignKey: 'modifiedBy',
      prevList: options,
      items: await findFromCore(subdomain, [doc.modifiedBy], 'users')
    });
  }

  if (doc.topicId) {
    const topic = await models.KnowledgeBaseTopics.findOne({
      _id: doc.topicId
    });

    if (topic) {
      options.push({ topicId: topic._id, name: topic.title });
    }
  }

  if (doc.categoryId) {
    const category = await models.KnowledgeBaseCategories.findOne({
      _id: doc.categoryId
    });

    if (category) {
      options.push({ categoryId: doc.categoryId, name: category.title });
    }
  }

  return options;
};

export const gatherDescriptions = async (
  models: IModels,
  subdomain: string,
  params: any
): Promise<IDescriptions> => {
  const { action, type, object, updatedDocument } = params;

  const description = `"${object.title}" has been ${action}d`;
  let extraDesc: LogDesc[] = [];

  switch (type) {
    case MODULE_NAMES.KB_TOPIC:
      extraDesc = await gatherKbTopicFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherKbTopicFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.KB_CATEGORY:
      extraDesc = await gatherKbCategoryFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherKbCategoryFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.KB_ARTICLE:
      extraDesc = await gatherKbArticleFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherKbArticleFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      break;
    default:
      break;
  }

  return { extraDesc, description };
};

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

export const putDeleteLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user
) => {
  const { description, extraDesc } = await gatherDescriptions(
    models,
    subdomain,
    {
      ...logDoc,
      action: LOG_ACTIONS.DELETE
    }
  );

  await commonPutDeleteLog(
    subdomain,
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `knowledgebase:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user
) => {
  const { description, extraDesc } = await gatherDescriptions(
    models,
    subdomain,
    {
      ...logDoc,
      action: LOG_ACTIONS.UPDATE
    }
  );

  await commonPutUpdateLog(
    subdomain,
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `knowledgebase:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user
) => {
  const { description, extraDesc } = await gatherDescriptions(
    models,
    subdomain,
    {
      ...logDoc,
      action: LOG_ACTIONS.CREATE
    }
  );

  await commonPutCreateLog(
    subdomain,
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `knowledgebase:${logDoc.type}` },
    user
  );
};

// message consumer
export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS)
  })
};
