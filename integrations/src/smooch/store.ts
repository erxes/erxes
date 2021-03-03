import {
  SmoochLineConversationMessages,
  SmoochLineConversations,
  SmoochLineCustomers,
  SmoochTelegramConversationMessages,
  SmoochTelegramConversations,
  SmoochTelegramCustomers,
  SmoochTwilioConversationMessages,
  SmoochTwilioConversations,
  SmoochTwilioCustomers,
  SmoochViberConversationMessages,
  SmoochViberConversations,
  SmoochViberCustomers
} from './models';
import {
  IAPIConversation,
  IAPIConversationMessage,
  IAPICustomer,
  IGetOrCreateArguments,
  ISmoochConversationArguments,
  ISmoochConversationMessageArguments,
  ISmoochCustomerArguments
} from './types';

import { debugError, debugSmooch } from '../debuggers';
import { sendRPCMessage } from '../messageBroker';
import { checkConcurrentError } from '../utils';

const SMOOCH_MODELS = {
  telegram: {
    customers: SmoochTelegramCustomers,
    conversations: SmoochTelegramConversations,
    conversationMessages: SmoochTelegramConversationMessages
  },
  viber: {
    customers: SmoochViberCustomers,
    conversations: SmoochViberConversations,
    conversationMessages: SmoochViberConversationMessages
  },
  line: {
    customers: SmoochLineCustomers,
    conversations: SmoochLineConversations,
    conversationMessages: SmoochLineConversationMessages
  },
  twilio: {
    customers: SmoochTwilioCustomers,
    conversations: SmoochTwilioConversations,
    conversationMessages: SmoochTwilioConversationMessages
  }
};

const createOrGetSmoochCustomer = async ({
  kind,
  integrationIds,
  surname,
  givenName,
  smoochUserId,
  phone,
  email,
  avatarUrl
}: ISmoochCustomerArguments) => {
  debugSmooch('Create or get smooch customer function called...');

  const { id, erxesApiId } = integrationIds;
  const common = { surname, givenName, email, phone, avatarUrl };

  const doc = {
    integrationId: id,
    smoochUserId,
    ...common
  };

  // fields to save on api
  const api = {
    integrationId: erxesApiId,
    firstName: givenName,
    lastName: surname,
    phones: [phone],
    primaryPhone: phone,
    emails: [email],
    primaryEmail: email,
    avatar: avatarUrl,
    kind
  };

  let customer;

  try {
    customer = await getOrCreate({
      kind,
      collectionName: 'customers',
      selector: { smoochUserId },
      fields: { doc, api }
    });
  } catch (e) {
    debugError(`Failed to getOrCreate customer: ${e.message}`);
    throw e;
  }

  return customer.erxesApiId;
};

const createOrGetSmoochConversation = async ({
  kind,
  smoochConversationId,
  customerId,
  integrationIds,
  content,
  createdAt
}: ISmoochConversationArguments) => {
  const { id, erxesApiId } = integrationIds;

  debugSmooch(`Creating smooch conversation kind: ${kind}`);

  const doc = {
    smoochConversationId,
    content,
    customerId,
    createdAt,
    integrationId: id,
    kind
  };

  // fields to save on api
  const api = {
    customerId,
    content,
    integrationId: erxesApiId,
    createdAt
  };

  let conversation;

  try {
    conversation = await getOrCreate({
      kind,
      collectionName: 'conversations',
      fields: { doc, api },
      selector: { smoochConversationId }
    });
  } catch (e) {
    debugError(`Failed to getOrCreate conversation: ${e.message}`);
    throw e;
  }

  return {
    id: conversation._id,
    erxesApiId: conversation.erxesApiId
  };
};

const createOrGetSmoochConversationMessage = async ({
  kind,
  conversationIds,
  messageId,
  content,
  customerId,
  attachments
}: ISmoochConversationMessageArguments) => {
  const { id, erxesApiId } = conversationIds;

  debugSmooch(`Creating smooch conversation message kind: ${kind}`);

  const doc = {
    customerId,
    conversationId: id,
    // message
    messageId,
    authorId: customerId,
    content
  };

  // fields to save on api
  let api;
  if (attachments) {
    api = {
      customerId,
      conversationId: erxesApiId,
      content,
      attachments
    };
  } else {
    api = {
      customerId,
      conversationId: erxesApiId,
      content
    };
  }
  let conversationMessage;

  try {
    conversationMessage = await getOrCreate({
      kind,
      collectionName: 'conversationMessages',
      selector: { messageId },
      fields: { doc, api }
    });
  } catch (e) {
    debugError(`Failed to getOrCreate conversationMessage: ${e.message}`);
    throw e;
  }

  return conversationMessage;
};

const getOrCreate = async ({
  kind,
  collectionName,
  selector,
  fields
}: IGetOrCreateArguments) => {
  const map = {
    customers: {
      action: 'get-create-update-customer',
      apiField: 'erxesApiId'
    },
    conversations: {
      action: 'create-or-update-conversation',
      apiField: 'erxesApiId'
    },
    conversationMessages: {
      action: 'create-conversation-message',
      apiField: 'erxesApiMessageId'
    }
  };

  const model = SMOOCH_MODELS[kind][collectionName];

  let selectedObj = await model.findOne(selector);

  if (!selectedObj) {
    try {
      selectedObj = await model.create(fields.doc);
    } catch (e) {
      checkConcurrentError(e, collectionName);
    }

    try {
      const response = await requestMainApi(
        map[collectionName].action,
        fields.api
      );

      selectedObj[map[collectionName].apiField] = response._id;

      await selectedObj.save();
    } catch (e) {
      await model.deleteOne({ _id: selectedObj._id });
      throw e;
    }
  }

  return selectedObj;
};

const requestMainApi = (
  action: string,
  params: IAPICustomer | IAPIConversation | IAPIConversationMessage
) => {
  return sendRPCMessage({
    action,
    metaInfo: action.includes('message') ? 'replaceContent' : null,
    payload: JSON.stringify(params)
  });
};

export {
  createOrGetSmoochCustomer,
  createOrGetSmoochConversation,
  createOrGetSmoochConversationMessage,
  SMOOCH_MODELS,
  requestMainApi
};
