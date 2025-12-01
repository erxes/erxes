import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IEngageMessage, IEngageMessageDocument } from './@types/types';

export type LogDesc = {
  [key: string]: any;
} & { name: any };

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

const gatherEngageFieldNames = async (
  subdomain: string,
  doc: IEngageMessageDocument | IEngageMessage,
  prevList?: LogDesc[],
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  const sendRPCMessage = async (args, callback) => {
    return callback({ ...args, isRPC: true, subdomain });
  };

  if (doc.segmentIds && doc.segmentIds.length > 0) {
    const segments = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'segments',
      action: 'find',
      input: { _id: { $in: doc.segmentIds } },
    });

    // commented
    // options = await gatherNames({
    //   foreignKey: 'segmentIds',
    //   prevList: options,
    //   nameFields: ['name'],
    //   items: segments,
    // });
  }

  if (doc.brandIds && doc.brandIds.length > 0) {
    const brands = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'brands',
      action: 'find',
      input: { query: { _id: { $in: doc.brandIds } } },
    });

        // commented
    // options = await gatherNames({
    //   foreignKey: 'brandIds',
    //   prevList: options,
    //   nameFields: ['name'],
    //   items: brands,
    // });
  }

  if (doc.customerTagIds && doc.customerTagIds.length > 0) {
    const tags = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'tags',
      action: 'find',
      input: { _id: { $in: doc.customerTagIds } },
    });

        // commented
    // options = await gatherNames({
    //   foreignKey: 'customerTagIds',
    //   prevList: options,
    //   nameFields: ['name'],
    //   items: tags,
    // });
  }

  if (doc.fromUserId) {
    const user = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: { _id: doc.fromUserId },
    });

        // commented
    // if (user && user._id) {
    //   options = await gatherNames({
    //     foreignKey: 'fromUserId',
    //     prevList: options,
    //     nameFields: ['email', 'username'],
    //     items: [user],
    //   });
    // }
  }

  if (doc.messenger && doc.messenger.brandId) {
    const brand = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'brands',
      action: 'findOne',
      input: { _id: doc.messenger.brandId },
    });

        // commented
    // if (brand) {
    //   options = await gatherNames({
    //     foreignKey: 'brandId',
    //     prevList: options,
    //     nameFields: ['name'],
    //     items: [brand],
    //   });
    // }
  }

  if (doc.createdBy) {
    const user = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: { _id: doc.createdBy },
    });

        // commented
    // if (user) {
    //   options = await gatherNames({
    //     foreignKey: 'createdBy',
    //     prevList: options,
    //     nameFields: ['email', 'username'],
    //     items: [user],
    //   });
    // }
  }

  if (doc.email && doc.email.templateId) {
    const template = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'emailTemplates',
      action: 'findOne',
      input: { _id: doc.email.templateId },
    });

        // commented
    // if (template) {
    //   options = await gatherNames({
    //     foreignKey: 'email.templateId',
    //     prevList: options,
    //     nameFields: ['name'],
    //     items: [template],
    //   });
    // }
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
      extraDesc,
    );
  }

  return { extraDesc, description };
};
