import { gatherNames, LogDesc } from '@erxes/api-utils/src/logDescHelper';

import {
  IEngageMessage,
  IEngageMessageDocument
} from '../../models/definitions/engages';
import { Segments, Users, EmailTemplates, Brands, Tags } from '../../apiCollections';

const gatherEngageFieldNames = async (
  doc: IEngageMessageDocument | IEngageMessage,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.segmentIds && doc.segmentIds.length > 0) {
    options = await gatherNames({
      collection: Segments,
      idFields: doc.segmentIds,
      foreignKey: 'segmentIds',
      prevList: options,
      nameFields: ['name']
    });
  }

  if (doc.brandIds && doc.brandIds.length > 0) {
    options = await gatherNames({
      collection: Brands,
      idFields: doc.brandIds,
      foreignKey: 'brandIds',
      prevList: options,
      nameFields: ['name']
    });
  }

  if (doc.customerTagIds && doc.customerTagIds.length > 0) {
    options = await gatherNames({
      collection: Tags,
      idFields: doc.customerTagIds,
      foreignKey: 'customerTagIds',
      prevList: options,
      nameFields: ['name']
    });
  }

  if (doc.fromUserId) {
    options = await gatherNames({
      collection: Users,
      idFields: [doc.fromUserId],
      foreignKey: 'fromUserId',
      prevList: options,
      nameFields: ['email', 'username']
    });
  }

  if (doc.messenger && doc.messenger.brandId) {
    options = await gatherNames({
      collection: Brands,
      idFields: [doc.messenger.brandId],
      foreignKey: 'brandId',
      prevList: options,
      nameFields: ['name']
    });
  }

  if (doc.createdBy) {
    options = await gatherNames({
      collection: Users,
      idFields: [doc.createdBy],
      foreignKey: 'createdBy',
      prevList: options,
      nameFields: ['email', 'username']
    });
  }

  if (doc.email && doc.email.templateId) {
    options = await gatherNames({
      collection: EmailTemplates,
      idFields: [doc.email.templateId],
      foreignKey: 'email.templateId',
      prevList: options,
      nameFields: ['name']
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
