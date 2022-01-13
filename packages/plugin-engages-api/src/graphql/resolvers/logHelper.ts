import {
  gatherNames,
  gatherBrandNames,
  gatherTagNames,
  gatherUsernames,
  LogDesc,
} from '@erxes/api-utils/src/logDescHelper';

import { IEngageMessage, IEngageMessageDocument } from '../../models/definitions/engages';
import { Segments } from '../../apiCollections';

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
    options = await gatherBrandNames({
      idFields: doc.brandIds,
      foreignKey: 'brandIds',
      prevList: options
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherTagNames({
      idFields: doc.tagIds,
      foreignKey: 'tagIds',
      prevList: options
    });
  }

  if (doc.fromUserId) {
    options = await gatherUsernames({
      idFields: [doc.fromUserId],
      foreignKey: 'fromUserId',
      prevList: options
    });
  }

  if (doc.messenger && doc.messenger.brandId) {
    options = await gatherBrandNames({
      idFields: [doc.messenger.brandId],
      foreignKey: 'brandId',
      prevList: options
    });
  }

  return options;
};

export const gatherDescriptions = async (params: any) => {
  const { action, object, updatedDocument } = params;

  const description = `"${object.title}" has been ${action}d`;
  let extraDesc: LogDesc[] = await gatherEngageFieldNames(object);

  if (updatedDocument) {
    extraDesc = await gatherEngageFieldNames(updatedDocument, extraDesc);
  }

  return { extraDesc, description };
};
