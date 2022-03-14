import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  LogDesc,
  gatherNames,
  IDescriptions,
  getSchemaLabels
} from '@erxes/api-utils/src/logUtils';

import { IModels } from './connectionResolver';
import messageBroker from './messageBroker';
import { IProductDocument, productSchema, productCategorySchema } from './models/definitions/products';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const MODULE_NAMES = {
  PRODUCT: 'product',
  PRODUCT_CATEGORY: 'productCategory',
};

const gatherProductFieldNames = async (
  models: IModels,
  doc: IProductDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'tagIds',
      prevList: options,
      nameFields: ['name'],
      items: await messageBroker().sendRPCMessage('tags:rpc_queue:find', { _id: { $in: doc.tagIds } })
    });
  }

  if (doc.categoryId) {
    options = await gatherNames({
      foreignKey: 'categoryId',
      prevList: options,
      nameFields: ['name'],
      items: await models.ProductCategories.find({ _id: { $in: [doc.categoryId] } }).lean()
    });
  }

  return options;
};

const gatherDescriptions = async (models: IModels, params: any): Promise<IDescriptions> => {
  const { action, type, object, updatedDocument } = params;

  let extraDesc: LogDesc[] = [];
  const description = `"${object.name}" has been ${action}d`;

  switch (type) {
    case MODULE_NAMES.PRODUCT:
      extraDesc = await gatherProductFieldNames(models, object);

      if (updatedDocument) {
        extraDesc = await gatherProductFieldNames(models, updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.PRODUCT_CATEGORY:
      const parentIds: string[] = [];

      if (object.parentId) {
        parentIds.push(object.parentId);
      }

      if (updatedDocument && updatedDocument.parentId !== object.parentId) {
        parentIds.push(updatedDocument.parentId);
      }

      if (parentIds.length > 0) {
        extraDesc = await gatherNames({
          foreignKey: 'parentId',
          nameFields: ['name'],
          items: await models.ProductCategories.find({ _id: { $in: parentIds } }).lean()
        });
      }

      break;
    default:
      break;
  }

  return { extraDesc, description };
};

export const putDeleteLog = async (models: IModels, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.DELETE,
  });

  await commonPutDeleteLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `products:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (models: IModels, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.UPDATE,
  });

  await commonPutUpdateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `products:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (models: IModels, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.CREATE,
  });

  await commonPutCreateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `products:${logDoc.type}` },
    user
  );
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(
      type,
      [{ name: 'product', schemas: [productSchema] }, { name: 'productCategory', schemas: [productCategorySchema] }]
    )
  })
};
