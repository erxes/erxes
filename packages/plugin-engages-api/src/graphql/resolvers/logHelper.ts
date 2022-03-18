import { gatherNames, LogDesc } from '@erxes/api-utils/src/logUtils';

import {
  sendCoreMessage,
  sendSegmentsMessage,
  sendTagsMessage,
} from '../../messageBroker';
import {
  IEngageMessage,
  IEngageMessageDocument,
} from '../../models/definitions/engages';

const gatherEngageFieldNames = async (
  subdomain: string,
  doc: IEngageMessageDocument | IEngageMessage,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  const sendRPCMessage = async (args, callback) => {
    return callback({ ...args, isRPC: true, subdomain });
  };

  if (doc.segmentIds && doc.segmentIds.length > 0) {
    const { data } = await sendRPCMessage(
      { action: 'find', data: { _id: { $in: doc.segmentIds } } },
      sendSegmentsMessage
    );

    options = await gatherNames({
      foreignKey: 'segmentIds',
      prevList: options,
      nameFields: ['name'],
      items: data,
    });
  }

  if (doc.brandIds && doc.brandIds.length > 0) {
    const { data } = await sendRPCMessage(
      {
        action: 'brands.find',
        data: { query: { _id: { $in: doc.brandIds } } },
      },
      sendCoreMessage
    );

    options = await gatherNames({
      foreignKey: 'brandIds',
      prevList: options,
      nameFields: ['name'],
      items: data,
    });
  }

  if (doc.customerTagIds && doc.customerTagIds.length > 0) {
    const { data } = await sendRPCMessage(
      { action: 'find', data: { _id: { $in: doc.customerTagIds } } },
      sendTagsMessage
    );

    options = await gatherNames({
      foreignKey: 'customerTagIds',
      prevList: options,
      nameFields: ['name'],
      items: data,
    });
  }

  if (doc.fromUserId) {
    const { data } = await sendRPCMessage(
      {
        action: 'users.findOne',
        data: { _id: doc.fromUserId },
      },
      sendCoreMessage
    );

    options = await gatherNames({
      foreignKey: 'fromUserId',
      prevList: options,
      nameFields: ['email', 'username'],
      items: [data],
    });
  }

  if (doc.messenger && doc.messenger.brandId) {
    const { data } = await sendRPCMessage(
      {
        action: 'brands.findOne',
        data: { _id: doc.messenger.brandId },
      },
      sendCoreMessage
    );

    options = await gatherNames({
      foreignKey: 'brandId',
      prevList: options,
      nameFields: ['name'],
      items: [data],
    });
  }

  if (doc.createdBy) {
    const { data } = await sendRPCMessage(
      {
        action: 'users.findOne',
        data: { _id: doc.createdBy },
      },
      sendCoreMessage
    );

    options = await gatherNames({
      foreignKey: 'createdBy',
      prevList: options,
      nameFields: ['email', 'username'],
      items: [data],
    });
  }

  // if (doc.email && doc.email.templateId) {
  //   options = await gatherNames({
  //     foreignKey: 'email.templateId',
  //     prevList: options,
  //     nameFields: ['name'],
  //     // EmailTemplates is not yet included in any plugins
  //     items: await findMongoDocuments('', generateOptions([doc.email.templateId], 'EmailTemplates'))
  //   });
  // }

  return options;
};

export const gatherDescriptions = async (subdomain: string, params: any) => {
  const { object, updatedDocument } = params;

  // action will be filled inside putLog()
  const description = `"${object.title}" has been`;

  let extraDesc: LogDesc[] = await gatherEngageFieldNames(subdomain, object);

  if (updatedDocument) {
    extraDesc = await gatherEngageFieldNames(
      subdomain,
      updatedDocument,
      extraDesc
    );
  }

  return { extraDesc, description };
};
