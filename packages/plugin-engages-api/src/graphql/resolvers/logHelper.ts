import { gatherNames, LogDesc } from '@erxes/api-utils/src/logUtils';
import { findMongoDocuments } from '../../messageBroker';

import {
  IEngageMessage,
  IEngageMessageDocument
} from '../../models/definitions/engages';

const gatherEngageFieldNames = async (
  doc: IEngageMessageDocument | IEngageMessage,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  const generateOptions = (ids: string[], collectionName: string) => ({
    query: { _id : { $in: ids } },
    name: collectionName
  });

  if (doc.segmentIds && doc.segmentIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'segmentIds',
      prevList: options,
      nameFields: ['name'],
      items: await findMongoDocuments('core', generateOptions(doc.segmentIds, 'Segments'))
    });
  }

  if (doc.brandIds && doc.brandIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'brandIds',
      prevList: options,
      nameFields: ['name'],
      items: await findMongoDocuments('core', generateOptions(doc.brandIds, 'Brands'))
    });
  }

  if (doc.customerTagIds && doc.customerTagIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'customerTagIds',
      prevList: options,
      nameFields: ['name'],
      items: await findMongoDocuments('tags', generateOptions(doc.customerTagIds, 'Tags'))
    });
  }

  if (doc.fromUserId) {
    options = await gatherNames({
      foreignKey: 'fromUserId',
      prevList: options,
      nameFields: ['email', 'username'],
      items: await findMongoDocuments('core', generateOptions([doc.fromUserId], 'Users'))
    });
  }

  if (doc.messenger && doc.messenger.brandId) {
    options = await gatherNames({
      foreignKey: 'brandId',
      prevList: options,
      nameFields: ['name'],
      items: await findMongoDocuments('core', generateOptions([doc.messenger.brandId], 'Brands'))
    });
  }

  if (doc.createdBy) {
    options = await gatherNames({
      foreignKey: 'createdBy',
      prevList: options,
      nameFields: ['email', 'username'],
      items: await findMongoDocuments('core', generateOptions([doc.createdBy], 'Users'))
    });
  }

  if (doc.email && doc.email.templateId) {
    options = await gatherNames({
      foreignKey: 'email.templateId',
      prevList: options,
      nameFields: ['name'],
      // EmailTemplates is not yet included in any plugins
      items: await findMongoDocuments('', generateOptions([doc.email.templateId], 'EmailTemplates'))
    });
  }

  return options;
};

export const gatherDescriptions = async (params: any) => {
  const { object, updatedDocument } = params;

  // action will be filled inside putLog()
  const description = `"${object.title}" has been`;

  let extraDesc: LogDesc[] = await gatherEngageFieldNames(object);

  if (updatedDocument) {
    extraDesc = await gatherEngageFieldNames(updatedDocument, extraDesc);
  }

  return { extraDesc, description };
};
