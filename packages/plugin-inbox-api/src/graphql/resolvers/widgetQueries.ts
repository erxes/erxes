import * as momentTz from 'moment-timezone';

import { IIntegrationDocument } from '../../models/definitions/integrations';

import { getOrCreateEngageMessage } from '../../widgetUtils';

import { getDocument, getDocumentList } from '../../cacheUtils';
import * as fs from 'fs';
import * as moment from 'moment';

// ? import { uploadFile, frontendEnv, getSubServiceDomain } from '@erxes/api-utils';

import { IBrowserInfo } from '@erxes/api-utils/src/definitions/common';
import { sendRPCMessage } from '../../messageBroker';
import { IContext, ICoreIModels, IModels } from '../../connectionResolver';

export const isMessengerOnline = async (models: IModels, integration: IIntegrationDocument) => {
  if (!integration.messengerData) {
    return false;
  }

  const {
    availabilityMethod,
    isOnline,
    onlineHours,
    timezone
  } = integration.messengerData;

  const modifiedIntegration = {
    ...(integration.toJSON ? integration.toJSON() : integration),
    messengerData: {
      availabilityMethod,
      isOnline,
      onlineHours,
      timezone
    }
  };

  return models.Integrations.isOnline(modifiedIntegration);
};

const messengerSupporters = async (models: IModels, coreModels: ICoreIModels, integration: IIntegrationDocument) => {
  const messengerData = integration.messengerData || { supporterIds: [] };

  return getDocumentList(models, coreModels, 'users', { _id: { $in: messengerData.supporterIds } });
};

const getWidgetMessages = (models: IModels,conversationId: string) => {
  return models.ConversationMessages.find({
    conversationId,
    internal: false,
    fromBot: { $exists: false }
  }).sort({
    createdAt: 1
  });
};

const getExportMessages = (models: IModels, conversationId: string) => {
  return models.ConversationMessages.aggregate([
    {
      $match: {
        conversationId,
        internal: false,
        fromBot: { $exists: false }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'customers',
        localField: 'customerId',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        createdAt: 1,
        'user.details.fullName': 1,
        content: 1,
        'customer.emails': 1
      }
    },
    { $sort: { createdAt: 1 } }
  ]);
};

const writeMessagesToFile = async (
  createdAt: any,
  messages: any,
  fileName: string
) => {
  return await new Promise<void>(resolve => {
    const stream = fs.createWriteStream(fileName);
    stream.once('open', () => {
      stream.write(`Conversation with Erxes\nStarted on ${createdAt}\n---\n`);
      for (const mg of messages) {
        stream.write(
          `${moment(mg.createdAt).format('LT')} | ${
            mg.user ? mg.user?.details?.fullName : mg.customer?.emails?.[0]
          } | ${mg.content}\n`
        );
      }
      stream.write(`---\nExported from Erxes on ${new Date()}`);
      stream.end();
    });

    stream.on('finish', resolve);
  });
};

export default {
  async widgetExportMessengerData(
    _root,
    args: { _id: string; integrationId: string },
    { requestInfo, models }: IContext
  ) {
    const { _id, integrationId } = args;

    const conversation = await models.Conversations.findOne({
      _id,
      integrationId
    }).lean();
    const integration = await models.Integrations.findOne({
      _id: integrationId
    }).lean();

    if (!conversation || !integration) {
      return null;
    }

    // aggregating conversation message with user, customer collections.
    const messages = await getExportMessages(models, conversation._id);

    const fileName = `EXPORTED_CONVERSATIONS.txt`;
    const newPath = `${fileName}`;

    // writing data to text file.
    await writeMessagesToFile(conversation.createdAt, messages, fileName);

    // ? const API_URL = frontendEnv({ name: 'API_URL', requestInfo });
    // ? const API_DOMAIN = API_URL || getSubServiceDomain({ name: 'API_DOMAIN' });

    // uploading a file to the server (aws, gcs, local).
    try {
      const file = {
        name: fileName,
        path: newPath,
        type: 'text/plain'
      };
      // ? const result = await uploadFile(API_DOMAIN, file, false);
      const result = '';

      // removing temporary written file.
      await fs.unlinkSync(fileName);

      return result;
    } catch (e) {
      throw new Error(e.message);
    }
  },

  widgetsGetMessengerIntegration(_root, args: { brandCode: string }, { models }: IContext) {
    return models.Integrations.getWidgetIntegration(args.brandCode, 'messenger');
  },

  widgetsConversations(
    _root,
    args: { integrationId: string; customerId?: string; visitorId?: string },
    { models }: IContext
  ) {
    const { integrationId, customerId, visitorId } = args;

    const query = customerId
      ? { integrationId, customerId }
      : { integrationId, visitorId };

    return models.Conversations.find(query).sort({ updatedAt: -1 });
  },

  async widgetsConversationDetail(
    _root,
    args: { _id: string; integrationId: string },
    { models, coreModels }: IContext
  ) {
    const { _id, integrationId } = args;

    const conversation = await models.Conversations.findOne({ _id, integrationId });
    const integration = await models.Integrations.findOne({
      _id: integrationId
    });

    // When no one writes a message
    if (!conversation && integration) {
      return {
        messages: [],
        isOnline: await isMessengerOnline(models, integration)
      };
    }

    if (!conversation || !integration) {
      return null;
    }

    return {
      _id,
      messages: await getWidgetMessages(models, conversation._id),
      isOnline: await isMessengerOnline(models, integration),
      operatorStatus: conversation.operatorStatus,
      participatedUsers: await getDocumentList(models, coreModels, 'users', {
        _id: { $in: conversation.participatedUserIds }
      }),
      supporters: await messengerSupporters(models, coreModels, integration)
    };
  },

  widgetsMessages(_root, args: { conversationId: string }, { models }: IContext) {
    const { conversationId } = args;

    return getWidgetMessages(models, conversationId);
  },

  widgetsUnreadCount(_root, args: { conversationId: string }, { models }: IContext) {
    const { conversationId } = args;

    return models.ConversationMessages.widgetsGetUnreadMessagesCount(conversationId);
  },

  async widgetsTotalUnreadCount(
    _root,
    args: { integrationId: string; customerId?: string },
    { models }: IContext
  ) {
    const { integrationId, customerId } = args;

    if (!customerId) {
      return 0;
    }
    // find conversations
    const convs = await models.Conversations.find({ integrationId, customerId });

    // find read messages count
    return models.ConversationMessages.countDocuments(
      models.Conversations.widgetsUnreadMessagesQuery(convs)
    );
  },

  async widgetsMessengerSupporters(
    _root,
    { integrationId }: { integrationId: string },
    { models, coreModels }: IContext
  ) {
    const integration = await getDocument(models, coreModels, 'integrations', {
      _id: integrationId
    });
    let timezone = '';

    if (!integration) {
      return {
        supporters: [],
        isOnline: false,
        serverTime: momentTz().tz()
      };
    }

    const messengerData = integration.messengerData || { supporterIds: [] };

    if (integration.messengerData && integration.messengerData.timezone) {
      timezone = integration.messengerData.timezone;
    }

    return {
      supporters: await getDocumentList(models, coreModels, 'users', {
        _id: { $in: messengerData.supporterIds || [] }
      }),
      isOnline: await isMessengerOnline(models, integration),
      serverTime: momentTz().tz(timezone)
    };
  },

  async widgetsGetEngageMessage(
    _root,
    {
      integrationId,
      customerId,
      visitorId,
      browserInfo
    }: {
      integrationId: string;
      customerId?: string;
      visitorId?: string;
      browserInfo: IBrowserInfo;
    },
    { models, coreModels }: IContext
  ) {
    return getOrCreateEngageMessage(
      models,
      coreModels,
      integrationId,
      browserInfo,
      visitorId,
      customerId
    );
  },

  async widgetsProductCategory(_root, { _id }: { _id: string }) {
    return {
      __typename: 'ProductCategory',
      _id
    };
  },

  async widgetsBookingProductWithFields(_root, { _id }: { _id: string }) {
    const fields = await sendRPCMessage('rpc_queue:Fields.find', {
      query: {
        contentType: 'product'
      },
      sort: {
        order: 1
      }
    });

    return {
      fields: fields.map(field => {
        return {
          __typename: 'Field',
          _id: field._id
        };
      }),
      product: {
        __typename: 'Product',
        _id
      }
    };
  }
};
