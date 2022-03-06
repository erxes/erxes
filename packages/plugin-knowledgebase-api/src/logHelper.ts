import { gatherNames, gatherUsernames, LogDesc, IDescriptions } from '@erxes/api-utils/src/logUtils';

import { ICategoryDocument, ITopicDocument } from "./models/definitions/knowledgebase";
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

  options = await gatherUsernames({
    foreignKey: 'modifiedBy',
    prevList: options,
    items: [await findUser([doc.modifiedBy])]
  });

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

  options = await gatherUsernames({
    foreignKey: 'modifiedBy',
    prevList: options,
    items: [await findUser([doc.modifiedBy])]
  });

  if (articles.length > 0) {
    for (const article of articles) {
      options.push({ articleIds: article._id, name: article.title });
    }
  }

  return options;
};

const gatherKbArticleFieldNames = async (params: any, prevList?: LogDesc[]) => {
  const { object, updatedDocument } = params;
  let options: LogDesc[] = [];
  
  if (prevList) {
    options = prevList;
  }

  options = await gatherUsernames({
    foreignKey: 'createdBy',
    prevList,
    items: [await findUser([object.createdBy])]
  });

  if (object.modifiedBy) {
    options = await gatherUsernames({
      foreignKey: 'modifiedBy',
      prevList: options,
      items: [await findUser([object.modifiedBy])]
    });
  }

  if (updatedDocument && updatedDocument.modifiedBy) {
    options = await gatherUsernames({
      foreignKey: 'modifiedBy',
      prevList: options,
      items: [await findUser([updatedDocument.modifiedBy])]
    });
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
      extraDesc = await gatherKbArticleFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherKbArticleFieldNames(updatedDocument, extraDesc);
      }

      break;
    default:
      break;
  }

  return { extraDesc, description };
};
