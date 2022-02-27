import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  LogDesc,
  IDescriptions,
} from '@erxes/api-utils/src/logUtils';

import messageBroker from './messageBroker';
import { Tags } from './models';
import { ITagDocument } from './models/definitions/tags';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

const gatherTagNames = async (doc: ITagDocument, prevList?: LogDesc[]) => {
  const options: LogDesc[] = prevList ? prevList : [];

  if (doc.parentId) {
    const parent = await Tags.findOne({ _id: doc.parentId });

    options.push({ parentId: doc.parentId, name: parent && parent.name })
  }

  if (doc.relatedIds) {
    const children = await Tags.find({ _id: { $in: doc.relatedIds } }).lean();

    if (children.length > 0) {
      options.push({ relatedIds: doc.relatedIds, name: children.map(c => c.name) })
    }
  }

  return options;
}

const gatherDescriptions = async (params: any): Promise<IDescriptions> => {
  const { action, object, updatedDocument } = params;

  const description = `"${object.name}" has been ${action}d`;
  let extraDesc: LogDesc[] = await gatherTagNames(object);

  if (updatedDocument) {
    extraDesc = await gatherTagNames(updatedDocument, extraDesc);
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
    { ...logDoc, description, extraDesc, type: `tags:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `tags:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `tags:${logDoc.type}` },
    user
  );
};
