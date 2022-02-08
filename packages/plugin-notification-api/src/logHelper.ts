import { gatherNames, LogDesc } from '@erxes/api-utils/src/logDescHelper';
import { Brands, Users } from './apiCollections';

import { KnowledgeBaseArticles, KnowledgeBaseCategories } from './models';
import {
  ICategoryDocument,
  ITopicDocument,
} from './models/definitions/knowledgebase';

const userFields = { collection: Users, nameFields: ['email', 'username'] };

const gatherKbTopicFieldNames = async (
  doc: ITopicDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherNames({
    ...userFields,
    idFields: [doc.createdBy],
    foreignKey: 'createdBy',
    prevList: options,
  });

  options = await gatherNames({
    ...userFields,
    idFields: [doc.modifiedBy],
    foreignKey: 'modifiedBy',
    prevList: options,
  });

  if (doc.brandId) {
    options = await gatherNames({
      collection: Brands,
      idFields: [doc.brandId],
      foreignKey: 'brandId',
      prevList: options,
      nameFields: ['name'],
    });
  }

  if (doc.categoryIds && doc.categoryIds.length > 0) {
    // categories are removed alongside
    const categories = await KnowledgeBaseCategories.find(
      { _id: { $in: doc.categoryIds } },
      { title: 1 }
    );

    for (const cat of categories) {
      options.push({
        categoryIds: cat._id,
        name: cat.title,
      });
    }
  }

  return options;
};

const gatherKbCategoryFieldNames = async (
  doc: ICategoryDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  const articles = await KnowledgeBaseArticles.find(
    { _id: { $in: doc.articleIds } },
    { title: 1 }
  );

  options = await gatherNames({
    ...userFields,
    idFields: [doc.createdBy],
    foreignKey: 'createdBy',
    prevList: options,
  });

  options = await gatherNames({
    ...userFields,
    idFields: [doc.modifiedBy],
    foreignKey: 'modifiedBy',
    prevList: options,
  });

  if (articles.length > 0) {
    for (const article of articles) {
      options.push({ articleIds: article._id, name: article.title });
    }
  }

  return options;
};

export const gatherCategoryDescriptions = async (params: any) => {
  const { object, updatedDocument } = params;

  const description = `"${object.title}" has been`;

  let extraDesc = await gatherKbCategoryFieldNames(object);

  if (updatedDocument) {
    extraDesc = await gatherKbCategoryFieldNames(updatedDocument, extraDesc);
  }

  return { extraDesc, description };
};

export const gatherTopicDescriptions = async (params: any) => {
  const { object, updatedDocument } = params;

  const description = `"${object.title}" has been`;

  let extraDesc = await gatherKbTopicFieldNames(object);

  if (updatedDocument) {
    extraDesc = await gatherKbTopicFieldNames(updatedDocument, extraDesc);
  }

  return { extraDesc, description };
};

export const gatherArticleDescriptions = async (params: any) => {
  const { object, updatedDocument } = params;

  const description = `"${object.title}" has been`;

  let extraDesc = await gatherNames({
    collection: Users,
    idFields: [object.createdBy],
    foreignKey: 'createdBy',
    nameFields: ['username', 'email'],
  });

  if (object.modifiedBy) {
    extraDesc = await gatherNames({
      ...userFields,
      idFields: [object.modifiedBy],
      foreignKey: 'modifiedBy',
      prevList: extraDesc,
    });
  }

  if (updatedDocument && updatedDocument.modifiedBy) {
    extraDesc = await gatherNames({
      ...userFields,
      idFields: [updatedDocument.modifiedBy],
      foreignKey: 'modifiedBy',
      prevList: extraDesc,
    });
  }

  return { description, extraDesc };
};
