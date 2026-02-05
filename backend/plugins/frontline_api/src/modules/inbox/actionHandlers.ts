import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { generateModels } from '~/connectionResolvers';
import { sendTRPCMessage, graphqlPubsub } from 'erxes-api-shared/utils';
import { RPError, RPSuccess } from 'erxes-api-shared/utils';

const sendError = (message): RPError => ({
  status: 'error',
  errorMessage: message,
});

const sendSuccess = (data): RPSuccess => ({
  status: 'success',
  data,
});

export const handleGetCreateUpdateCustomer = async (
  subdomain: string,
  doc: any,
) => {
  const { Integrations } = await generateModels(subdomain);

  const integration = await Integrations.findOne({
    _id: doc.integrationId,
  });

  if (!integration) {
    return sendError(`Integration not found: ${doc.integrationId}`);
  }

  const { primaryEmail, primaryPhone } = doc;
  let customer;

  const getCustomer = async (selector) => {
    return await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: { query: selector },
    });
  };

  if (primaryPhone) {
    customer = await getCustomer({ customerPrimaryPhone: primaryPhone });
    if (customer) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'updateCustomer',
        input: {
          doc: {
            _id: customer._id,
            doc,
          },
        },
      });
      return sendSuccess({ _id: customer._id });
    }
  }

  if (primaryEmail) {
    customer = await getCustomer({ primaryEmail });
  }

  if (customer) {
    return sendSuccess({ _id: customer?._id });
  } else {
    customer = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'customers',
      action: 'createCustomer',
      input: {
        doc: {
          ...doc,
        },
      },
    });
  }

  return sendSuccess({ _id: customer?._id });
};

export const handleCreateOrUpdateConversation = async (
  subdomain: string,
  doc: any,
) => {
  const { Conversations } = await generateModels(subdomain);
  const {
    conversationId,
    content,
    owner,
    updatedAt,
    integrationId,
    customerId,
  } = doc;

  let user;

  if (owner) {
    user = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: {
        query: {
          'details.operatorPhone': owner,
        },
      },
    });
  }

  let assignedUserId = user ? user._id : null;

  if (conversationId) {
    if (!assignedUserId) {
      const existingConversation = await Conversations.findOne({
        $and: [{ _id: conversationId }, { integrationId: integrationId }],
      }).lean();

      assignedUserId = existingConversation?.assignedUserId || null;
    }

    const conversation = await Conversations.findOne({
      $and: [{ _id: conversationId }, { integrationId: integrationId }],
    }).lean();

    if (conversation) {
      const updatedDoc = {
        content,
        assignedUserId,
        updatedAt,
        readUserIds: [],
        status: CONVERSATION_STATUSES.OPEN,
      } as any;

      if (customerId) {
        updatedDoc.customerId = customerId;
      }

      await Conversations.updateConversation(conversationId, updatedDoc);
    } else {
      const formattedDoc = {
        _id: doc.conversationId,
        customerId: doc.customerId,
        integrationId: doc.integrationId,
        content: doc.content,
        attachments: doc.attachments,
        conversationId: doc.conversationId,
        updatedAt: doc.updatedAt,
      };
      await Conversations.createConversation(formattedDoc);
    }

    return sendSuccess({ _id: conversationId });
  }

  doc.assignedUserId = assignedUserId;
  const conversation = await Conversations.createConversation(doc);

  return sendSuccess({ _id: conversation._id });
};

export const handleCreateConversationMessage = async (
  subdomain: string,
  doc: any,
  metaInfo?: string,
) => {
  const { ConversationMessages, Conversations } = await generateModels(
    subdomain,
  );

  const message = await ConversationMessages.createMessage(doc);

  const conversationDoc: {
    status: string;
    readUserIds: string[];
    content?: string;
    updatedAt?: Date;
  } = {
    status:
      doc.unread || doc.unread === undefined
        ? CONVERSATION_STATUSES.OPEN
        : CONVERSATION_STATUSES.CLOSED,
    readUserIds: [],
  };

  if (message.content && metaInfo === 'replaceContent') {
    conversationDoc.content = message.content;
  }

  if (doc.createdAt) {
    conversationDoc.updatedAt = doc.createdAt;
  }

  await Conversations.updateConversation(
    message.conversationId,
    conversationDoc,
  );

  await graphqlPubsub.publish(
    `conversationMessageInserted:${message.conversationId}`,
    {
      conversationMessageInserted: message,
    },
  );

  return sendSuccess({ _id: message._id });
};

export const handleGetConfigs = async (subdomain: string) => {
  const configs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'config',
    action: 'getConfig',
    input: {},
  });

  return sendSuccess({ configs });
};

export const handleGetUserIds = async (subdomain: string) => {
  const users = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'getIds',
    input: {},
    defaultValue: [],
  });

  return sendSuccess({ userIds: users.map((user) => user._id) });
};
