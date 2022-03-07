import { gatherNames, gatherUsernames, LogDesc, IDescriptions } from '@erxes/api-utils/src/logUtils';

import { IArticleDocument, ICategoryDocument, ITopicDocument } from "./models/definitions/knowledgebase";
import messageBroker from './messageBroker';
import { MODULE_NAMES } from './constants';
import { IModels } from './connectionResolver';

const findUser = async (ids: string[]) => {
  return await messageBroker().sendRPCMessage('core:rpc_queue:findOneUser', { _id: { $in: ids } });
};

const gatherKbTopicFieldNames = async (
  models: IModels,
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
    items: [await findUser([doc.createdBy])]
  });

  if (doc.modifiedBy) {
    options = await gatherUsernames({
      foreignKey: 'modifiedBy',
      prevList: options,
      items: [await findUser([doc.modifiedBy])]
    });
  }

  if (doc.brandId) {
    options = await gatherNames({
      foreignKey: 'brandId',
      prevList: options,
      nameFields: ['name'],
      items: [await messageBroker().sendRPCMessage('core:rpc_queue:findOneBrand', { _id: doc.brandId })]
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
    items: [await findUser([doc.createdBy])]
  });

  if (doc.modifiedBy) {
    options = await gatherUsernames({
      foreignKey: 'modifiedBy',
      prevList: options,
      items: [await findUser([doc.modifiedBy])]
    });
  }

  if (articles.length > 0) {
    for (const article of articles) {
      options.push({ articleIds: article._id, name: article.title });
    }
  }

  if (doc.topicId) {
    const topic = await models.KnowledgeBaseTopics.findOne({ _id: doc.topicId });

    if (topic) {
      options.push({ topicId: doc.topicId, name: topic.title });
    }
  }

  return options;
};

const gatherKbArticleFieldNames = async (models: IModels, doc: IArticleDocument, prevList?: LogDesc[]) => {
  let options: LogDesc[] = [];
  
  if (prevList) {
    options = prevList;
  }

  if (doc.createdBy) {
    options = await gatherUsernames({
      foreignKey: 'createdBy',
      prevList,
      items: [await findUser([doc.createdBy])]
    });
  }

  if (doc.modifiedBy) {
    options = await gatherUsernames({
      foreignKey: 'modifiedBy',
      prevList: options,
      items: [await findUser([doc.modifiedBy])]
    });
  }

  if (doc.topicId) {
    const topic = await models.KnowledgeBaseTopics.findOne({ _id: doc.topicId });

    if (topic) {
      options.push({ topicId: topic._id, name: topic.title });
    }
  }

  if (doc.categoryId) {
    const category = await models.KnowledgeBaseCategories.findOne({ _id: doc.categoryId });

    if (category) {
      options.push({ categoryId: doc.categoryId, name: category.title });
    }
  }

  return options;
}

export const gatherDescriptions = async (models: IModels, params: any): Promise<IDescriptions> => {
  const { action, type, object, updatedDocument } = params;

  const description = `"${object.title}" has been ${action}d`;
  let extraDesc: LogDesc[] = [];

  switch (type) {
    case MODULE_NAMES.KB_TOPIC:
      extraDesc = await gatherKbTopicFieldNames(models, object);

      if (updatedDocument) {
        extraDesc = await gatherKbTopicFieldNames(models, updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.KB_CATEGORY:
      extraDesc = await gatherKbCategoryFieldNames(models, object);

      if (updatedDocument) {
        extraDesc = await gatherKbCategoryFieldNames(models, updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.KB_ARTICLE:
      extraDesc = await gatherKbArticleFieldNames(models, object);

      if (updatedDocument) {
        extraDesc = await gatherKbArticleFieldNames(models, updatedDocument, extraDesc);
      }

      break;
    default:
      break;
  }

  return { extraDesc, description };
};
