import {
  LogDesc,
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  getSchemaLabels,
  gatherNames
} from '@erxes/api-utils/src/logUtils';

import {
  engageMessageSchema,
  emailSchema,
  scheduleDateSchema,
  messengerSchema,
  IEngageMessageDocument,
  IEngageMessage
} from './models/definitions/engages';
import messageBroker, {
  sendSegmentsMessage,
  sendCoreMessage,
  sendTagsMessage,
  sendEmailTemplatesMessage
} from './messageBroker';
import configs from './configs';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

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
    const segments = await sendRPCMessage(
      { action: 'find', data: { _id: { $in: doc.segmentIds } } },
      sendSegmentsMessage
    );

    options = await gatherNames({
      foreignKey: 'segmentIds',
      prevList: options,
      nameFields: ['name'],
      items: segments
    });
  }

  if (doc.brandIds && doc.brandIds.length > 0) {
    const brands = await sendRPCMessage(
      {
        action: 'brands.find',
        data: { query: { _id: { $in: doc.brandIds } } }
      },
      sendCoreMessage
    );

    options = await gatherNames({
      foreignKey: 'brandIds',
      prevList: options,
      nameFields: ['name'],
      items: brands
    });
  }

  if (doc.customerTagIds && doc.customerTagIds.length > 0) {
    const tags = await sendRPCMessage(
      { action: 'find', data: { _id: { $in: doc.customerTagIds } } },
      sendTagsMessage
    );

    options = await gatherNames({
      foreignKey: 'customerTagIds',
      prevList: options,
      nameFields: ['name'],
      items: tags
    });
  }

  if (doc.fromUserId) {
    const user = await sendRPCMessage(
      {
        action: 'users.findOne',
        data: { _id: doc.fromUserId }
      },
      sendCoreMessage
    );

    if (user && user._id) {
      options = await gatherNames({
        foreignKey: 'fromUserId',
        prevList: options,
        nameFields: ['email', 'username'],
        items: [user]
      });
    }
  }

  if (doc.messenger && doc.messenger.brandId) {
    const brand = await sendRPCMessage(
      {
        action: 'brands.findOne',
        data: { _id: doc.messenger.brandId }
      },
      sendCoreMessage
    );

    if (brand) {
      options = await gatherNames({
        foreignKey: 'brandId',
        prevList: options,
        nameFields: ['name'],
        items: [brand]
      });
    }
  }

  if (doc.createdBy) {
    const user = await sendRPCMessage(
      {
        action: 'users.findOne',
        data: { _id: doc.createdBy }
      },
      sendCoreMessage
    );

    if (user) {
      options = await gatherNames({
        foreignKey: 'createdBy',
        prevList: options,
        nameFields: ['email', 'username'],
        items: [user]
      });
    }
  }

  if (doc.email && doc.email.templateId) {
    const template = await sendRPCMessage(
      {
        action: 'findOne',
        data: { _id: doc.email.templateId }
      },
      sendEmailTemplatesMessage
    );

    if (template) {
      options = await gatherNames({
        foreignKey: 'email.templateId',
        prevList: options,
        nameFields: ['name'],
        items: [template]
      });
    }
  }

  return options;
};

export const gatherDescriptions = async (subdomain: string, params: any) => {
  const { object, updatedDocument, action } = params;
  const description = `"${object.title}" has been ${action}d`;

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

export const putDeleteLog = async (subdomain: string, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(subdomain, {
    ...logDoc,
    action: LOG_ACTIONS.DELETE
  });

  await commonPutDeleteLog(
    subdomain,
    messageBroker(),
    {
      ...logDoc,
      description,
      extraDesc,
      type: `${configs.name}:${logDoc.type}`
    },
    user
  );
};

export const putUpdateLog = async (subdomain: string, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(subdomain, {
    ...logDoc,
    action: LOG_ACTIONS.UPDATE
  });

  await commonPutUpdateLog(
    subdomain,
    messageBroker(),
    {
      ...logDoc,
      description,
      extraDesc,
      type: `${configs.name}:${logDoc.type}`
    },
    user
  );
};

export const putCreateLog = async (subdomain: string, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(subdomain, {
    ...logDoc,
    action: LOG_ACTIONS.CREATE
  });

  await commonPutCreateLog(
    subdomain,
    messageBroker(),
    {
      ...logDoc,
      description,
      extraDesc,
      type: `${configs.name}:${logDoc.type}`
    },
    user
  );
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, [
      {
        name: 'engage',
        schemas: [
          engageMessageSchema,
          emailSchema,
          scheduleDateSchema,
          messengerSchema
        ]
      }
    ])
  })
};
