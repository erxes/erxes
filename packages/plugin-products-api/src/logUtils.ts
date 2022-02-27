import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  LogDesc,
  gatherNames,
  IDescriptions,
} from '@erxes/api-utils/src/logUtils';

import messageBroker from './messageBroker';
import { ProductCategories } from './models';
import { IProductDocument } from './models/definitions/products';

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
      items: await ProductCategories.find({ _id: { $in: [doc.categoryId] } }).lean()
    });
  }

  return options;
};

const gatherDescriptions = async (params: any): Promise<IDescriptions> => {
  const { action, type, object, updatedDocument } = params;

  let extraDesc: LogDesc[] = [];
  const description = `"${object.name}" has been ${action}d`;

  switch (type) {
    case MODULE_NAMES.PRODUCT:
      extraDesc = await gatherProductFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherProductFieldNames(updatedDocument, extraDesc);
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
          items: await ProductCategories.find({ _id: { $in: parentIds } }).lean()
        });
      }

      break;
    default:
      break;
  }

  return { extraDesc, description };
};

export const putDeleteLog = async (logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions({
    ...logDoc,
    action: LOG_ACTIONS.DELETE,
  });

  await commonPutDeleteLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `products:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions({
    ...logDoc,
    action: LOG_ACTIONS.UPDATE,
  });

  await commonPutUpdateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `products:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions({
    ...logDoc,
    action: LOG_ACTIONS.CREATE,
  });

  await commonPutCreateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `products:${logDoc.type}` },
    user
  );
};
