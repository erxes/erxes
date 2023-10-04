import { sendRequest } from '@erxes/api-utils/src';
import { sendCommonMessage, sendInboxMessage } from './messageBroker';
import { randomAlphanumeric } from '@erxes/api-utils/src/random';
import { graphqlPubsub } from './configs';

const authenticate = async () => {
  const path = 'chatapi/auth/signin';

  try {
    const response = await sendRequest({
      url: `${process.env.GOLOMT_POST_URL}${path}`,
      method: 'POST',
      body: {
        username: process.env.GOLOMT_API_USERNAME || '',
        password: process.env.GOLOMT_API_PASSWORD || '',
        key: process.env.GOLOMT_API_KEY || ''
      }
    });

    await sendCommonMessage({
      subdomain: 'os',
      serviceName: 'core',
      action: 'configs.findOne',
      data: {
        code: 'GOLOMT_ACCESS_TOKEN',
        value: response
      },
      isRPC: true,
      defaultValue: null
    });

    return response;
  } catch (e) {
    return { status: 'error', message: e.message };
  }
};

const checkAccessToken = async () => {
  const token = await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'core',
    action: 'configs.findOne',
    data: {
      query: {
        code: 'GOLOMT_ACCESS_TOKEN'
      }
    },
    isRPC: true,
    defaultValue: null
  });

  if (!token) {
    return authenticate();
  }

  if (!token.value) {
    return authenticate();
  }

  if (!token.value.expires_in) {
    return authenticate();
  }

  if (!token.value.access_token) {
    return authenticate();
  }

  const now = new Date(Date.now());

  if (now > new Date(Date.parse(token.value.expires_in))) {
    return authenticate();
  }

  return token.value;
};

const getCustomerName = customer => {
  if (!customer) {
    return '';
  }

  if (customer.firstName && customer.lastName) {
    return `${customer.firstName} - ${customer.lastName}`;
  }

  if (customer.firstName) {
    return customer.firstName;
  }

  if (customer.lastName) {
    return customer.lastName;
  }

  if (customer.primaryEmail) {
    return customer.primaryEmail;
  }

  if (customer.primaryPhone) {
    return customer.primaryPhone;
  }

  return '';
};

export const sendMsgToGolomt = async (
  msg: any,
  customer: any,
  integrationId: string
) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const writeMsgUrl = 'chatapi/api/chat/write';

  const tokenVal = await checkAccessToken();

  if (tokenVal.status === 'error') {
    console.error(`dont signin to golomt, because: ${tokenVal.message}`);
    return;
  }

  try {
    const integration = await sendInboxMessage({
      subdomain: 'os',
      action: 'integrations.findOne',
      data: {
        _id: integrationId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!integration) {
      console.error(
        `dont send message to golomt, because: integration not found with id ${integrationId}`
      );
      return;
    }

    const brand = await sendCommonMessage({
      subdomain: 'os',
      serviceName: 'core',
      action: 'brands.findOne',
      data: {
        _id: integration?.brandId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!brand) {
      console.error(
        `dont send message to golomt, because: brand not found with id ${integration?.brandId}`
      );
      return;
    }

    const body = {
      social_id: msg.conversationId,
      social_type: 5,
      social_brand: brand?.name || '',
      text: msg.content || '',
      user_name: getCustomerName(customer),
      user_psid: customer._id,
      user_email: customer.primaryEmail || '',
      user_phone: customer.primaryPhone || '',
      file_url: msg.attachments || []
    };

    await sendRequest({
      url: `${process.env.GOLOMT_POST_URL}${writeMsgUrl}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenVal.access_token}` },
      body
    });
  } catch (e) {
    console.error(`dont send message to golomt, because: ${e.message}`);
    return;
  }
};

export const generateExpiredToken = async (args: any) => {
  const { apiKey, userName, password, tokenKey } = args;

  const apiKeyConfig = process.env.GOLOMT_API_KEY;

  if (apiKeyConfig !== apiKey) {
    throw new Error('wrong API_KEY');
  }

  const user = await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'core',
    action: 'users.checkLoginAuth',
    data: {
      email: userName,
      password
    },
    isRPC: true,
    defaultValue: null
  });

  if (!user) {
    throw new Error('auth failed');
  }

  const golomtTokenConfig = await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'core',
    action: 'configs.findOne',
    data: {
      code: 'GOLOMT_API_TOKENS'
    },
    isRPC: true,
    defaultValue: null
  });

  const tokenByUserId = golomtTokenConfig?.value || {};

  const apiToken = randomAlphanumeric(50);
  const expired = new Date(Date.now() + 259200000);

  tokenByUserId[user._id] = {
    apiToken,
    expired,
    userId: user._id
  };

  await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'core',
    action: 'configs.createOrUpdateConfig',
    data: {
      code: 'GOLOMT_API_TOKENS',
      value: tokenByUserId
    },
    isRPC: true
  });

  return {
    apiKey,
    userName,
    tokenKey,
    apiToken,
    expired
  };
};

export const hookMessage = async (args: any) => {
  const { apiKey, apiToken } = args;
  if (!apiKey || !apiToken) {
    throw new Error('has not apiKey or ApiToken');
  }

  if (apiKey !== process.env.GOLOMT_API_KEY) {
    throw new Error('Wrong apiKey');
  }

  const configTokens = await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'core',
    action: 'configs.findOne',
    data: {
      code: 'GOLOMT_API_TOKENS'
    },
    isRPC: true,
    defaultValue: null
  });
  const tokenByUserId = configTokens?.value || {};
  const tokenValue: Array<{
    apiToken: string;
    expired: Date;
    userId: string;
  }> = Object.values(tokenByUserId) || [];
  const token = tokenValue.find(item => item?.apiToken === apiToken);

  if (!token) {
    throw new Error('apiToken not found');
  }

  if (token.expired < new Date(Date.now())) {
    throw new Error('apiToken was expired');
  }

  const message = args.message;

  let customerId = message.customerId || '';
  if (customerId) {
    delete message[customerId];
  } else {
    // const conversation = await Conversations.getConversation(
    //   message.conversationId
    // );
    const conversation = await sendInboxMessage({
      subdomain: 'os',
      action: 'conversations.findOne',
      data: {
        _id: message.conversationId
      },
      isRPC: true,
      defaultValue: null
    });
    customerId = conversation.customerId || '';
  }

  message.userId = token.userId;

  // const msgDocument = await ConversationMessages.createMessage(message);
  const msgDocument = await sendInboxMessage({
    subdomain: 'os',
    action: 'conversationMessages.createOnlyMessage',
    data: message,
    isRPC: true,
    defaultValue: null
  });

  // await publishMessage(msgDocument, customerId);

  graphqlPubsub.publish('conversationMessageInserted', {
    conversationMessageInserted: {
      ...message.toObject(),
      conversationId: message.conversationId
    }
  });

  return {
    status: 'success'
  };
};
