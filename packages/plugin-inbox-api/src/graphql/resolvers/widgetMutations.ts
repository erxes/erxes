import * as strip from 'strip';

// ? import {
//   IVisitorContactInfoParams
// } from '../../../db/models/Customers';

import {
  CONVERSATION_OPERATOR_STATUS,
  CONVERSATION_STATUSES,
  KIND_CHOICES,
  MESSAGE_TYPES
} from '../../models/definitions/constants';

// ? import { ISubmission } from '../../../db/models/definitions/fields';

import {
  IAttachment,
  IIntegrationDocument,
  IMessengerDataMessagesItem
} from '../../models/definitions/integrations';

import { debug } from '../../configs';

// ? import { trackViewPageEvent } from '../../../events';

import { get, set } from '../../inmemoryStorage';
import { graphqlPubsub } from '../../configs';

import {
  AUTO_BOT_MESSAGES,
  BOT_MESSAGE_TYPES
} from '../../models/definitions/constants';

import { sendRequest } from '@erxes/api-utils/src';

import { solveSubmissions } from '../../widgetUtils';
import { getDocument, getMessengerApps } from '../../cacheUtils';
import { conversationNotifReceivers } from './conversationMutations';
import { IBrowserInfo } from '@erxes/api-utils/src/definitions/common';
import {
  sendConformityMessage,
  sendContactMessage,
  sendContactRPCMessage,
  sendFormRPCMessage,
  sendMessage,
  sendProductRPCMessage,
  sendToLog,
  client as msgBrokerClient,
  sendRPCMessage
} from '../../messageBroker';
import { trackViewPageEvent } from '../../events';
import EditorAttributeUtil from '@erxes/api-utils/src/editorAttributeUtils';
import { getService, getServices } from '../../redis';
import { IContext, ICoreIModels, IModels } from '../../connectionResolver';

// ? import { IFormDocument } from '../../../db/models/definitions/forms';

interface IWidgetEmailParams {
  toEmails: string[];
  fromEmail: string;
  title: string;
  content: string;
  customerId?: string;
  formId?: string;
  attachments?: IAttachment[];
}

const pConversationClientMessageInserted = async (models, message) => {
  const conversation = await models.Conversations.findOne(
    {
      _id: message.conversationId
    },
    { integrationId: 1 }
  );

  let integration;

  if (conversation) {
    integration = await models.Integrations.findOne(
      {
        _id: conversation.integrationId
      },
      { _id: 1 }
    );
  }

  let channelMemberIds: string[] = [];

  if (integration) {
    const channels = await models.Channels.find(
      {
        integrationIds: { $in: [integration._id] }
      },
      { _id: 1 }
    );

    for (const channel of channels) {
      channelMemberIds = [...channelMemberIds, ...(channel.memberIds || [])];
    }
  }

  graphqlPubsub.publish('conversationClientMessageInserted', {
    conversationClientMessageInserted: message,
    conversation,
    integration,
    channelMemberIds
  });
};

export const getMessengerData = async (models: IModels, integration: IIntegrationDocument) => {
  let messagesByLanguage: IMessengerDataMessagesItem | null = null;
  let messengerData = integration.messengerData;

  if (messengerData) {
    if (messengerData.toJSON) {
      messengerData = messengerData.toJSON();
    }

    const languageCode = integration.languageCode || 'en';
    const messages = (messengerData || {}).messages;

    if (messages) {
      messagesByLanguage = messages[languageCode];
    }
  }

  // knowledgebase app =======
  const kbApp = await getMessengerApps(models, 'knowledgebase', integration._id);

  const topicId = kbApp && kbApp.credentials ? kbApp.credentials.topicId : null;

  // lead app ==========
  const leadApps = await getMessengerApps(models, 'lead', integration._id, false);

  const formCodes = [] as string[];

  for (const app of leadApps) {
    if (app && app.credentials) {
      formCodes.push(app.credentials.formCode);
    }
  }

  // website app ============
  const websiteApps = await getMessengerApps(models, 'website', integration._id, false);

  return {
    ...(messengerData || {}),
    messages: messagesByLanguage,
    knowledgeBaseTopicId: topicId,
    websiteApps,
    formCodes
  };
};

const createVisitor = async (visitorId: string) =>
  sendContactRPCMessage('create_customer', {
    state: 'visitor',
    visitorId
  });

const createFormConversation = async (
  models: IModels,
  coreModels: ICoreIModels,
  args: {
    integrationId: string;
    formId: string;
    submissions: any[];
    browserInfo: any;
    cachedCustomerId?: string;
  },
  generateContent: (form) => string,
  generateConvData: () => {
    conversation?: any;
    message: any;
  },
  type?: string,
) => {
  const { integrationId, formId, submissions } = args;

  const form = await coreModels.Forms.findOne({ _id: formId });

  if (!form) {
    throw new Error('Form not found');
  }

  const errors = await sendFormRPCMessage('validate', { formId, submissions });

  if (errors.length > 0) {
    return { status: 'error', errors };
  }

  const content = await generateContent(form);

  const cachedCustomer = await solveSubmissions(models, coreModels, args);

  const conversationData = await generateConvData();

  // create conversation
  const conversation = await models.Conversations.createConversation({
    integrationId,
    customerId: cachedCustomer._id,
    content,
    ...conversationData.conversation
  });

  // create message
  const message = await models.ConversationMessages.createMessage({
    conversationId: conversation._id,
    customerId: cachedCustomer._id,
    content,
    ...conversationData.message
  });

  await pConversationClientMessageInserted(models, message);

  graphqlPubsub.publish('conversationMessageInserted', {
    conversationMessageInserted: message
  });

  if (type === 'lead') {
    // increasing form submitted count
    await models.Integrations.increaseContactsGathered(formId);

    const formData = {
      formId: args.formId,
      submissions: args.submissions,
      customer: cachedCustomer,
      cachedCustomerId: cachedCustomer._id,
      conversationId: conversation._id
    };

    // ?    await sendToWebhook('create', 'popupSubmitted', formData);
  }

  return {
    status: 'ok',
    messageId: message._id,
    customerId: cachedCustomer._id
  };
};

const widgetMutations = {
  // Find integrationId by brandCode
  async widgetsLeadConnect(
    _root,
    args: { brandCode: string; formCode: string; cachedCustomerId?: string },
    { models, coreModels }: IContext
  ) {
    const brand = await getDocument(models, coreModels, 'brands', { code: args.brandCode });

    const form = await coreModels.Forms.findOne({ code: args.formCode });

    if (!brand || !form) {
      throw new Error('Invalid configuration');
    }

    // find integration by brandId & formId
    const integ = await models.Integrations.getIntegration({
      brandId: brand._id,
      formId: form._id,
      isActive: true
    });

    if (integ.leadData && integ.leadData.loadType === 'embedded') {
      await models.Integrations.increaseViewCount(form._id);
    }

    if (integ.createdUserId) {
      const user = await coreModels.Users.findOne({ _id: integ.createdUserId });

      sendMessage('registerOnboardHistory', {
        type: 'leadIntegrationInstalled',
        user
      });
    }

    if (integ.leadData?.isRequireOnce && args.cachedCustomerId) {
      const conversation = await models.Conversations.findOne({
        customerId: args.cachedCustomerId,
        integrationId: integ._id
      });
      if (conversation) {
        return null;
      }
    }

    // return integration details
    return {
      integration: integ,
      form
    };
  },

  // create new conversation using form data
  async widgetsSaveLead(
    _root,
    args: {
      integrationId: string;
      formId: string;
      submissions: any[];
      browserInfo: any;
      cachedCustomerId?: string;
      userId?: string;
    },
    { models, coreModels }: IContext
  ) {
    const { submissions } = args;

    return createFormConversation(
      models,
      coreModels,
      args,
      form => {
        return form.title;
      },
      () => {
        return {
          message: {
            formWidgetData: submissions
          }
        };
      },
      'lead',
    );
  },

  widgetsLeadIncreaseViewCount(_root, { formId }: { formId: string }, { models }: IContext) {
    return models.Integrations.increaseViewCount(formId);
  },

  /*
   * Create a new customer or update existing customer info
   * when connection established
   */
  async widgetsMessengerConnect(
    _root,
    args: {
      brandCode: string;
      email?: string;
      phone?: string;
      code?: string;
      isUser?: boolean;
      companyData?: any;
      data?: any;
      cachedCustomerId?: string;
      deviceToken?: string;
      visitorId?: string;
    },
    { models, coreModels }: IContext
  ) {
    const {
      brandCode,
      email,
      phone,
      code,
      isUser,
      companyData,
      data,

      cachedCustomerId,
      deviceToken,
      visitorId
    } = args;

    const customData = data;

    // find brand
    const brand = await getDocument(models, coreModels, 'brands', { code: brandCode });

    if (!brand) {
      throw new Error('Invalid configuration');
    }

    // find integration
    const integration = await getDocument(models, coreModels, 'integrations', {
      brandId: brand._id,
      kind: KIND_CHOICES.MESSENGER
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    let customer;

    if (cachedCustomerId || email || phone || code) {
      customer = await sendContactRPCMessage('getWidgetCustomer', {
        integrationId: integration._id,
        cachedCustomerId,
        email,
        phone,
        code
      })

      const doc = {
        integrationId: integration._id,
        email,
        phone,
        code,
        isUser,
        deviceToken,
        scopeBrandIds: [brand._id]
      };

      customer = customer
        ? await sendContactRPCMessage('updateMessengerCustomer', {
            _id: customer._id,
            doc,
            customData
          })
        : await sendContactRPCMessage('createMessengerCustomer', {
            doc,
            customData
          });
    }

    if (visitorId) {
      sendToLog('visitor:createOrUpdate', {
        visitorId,
        integrationId: integration._id,
        scopeBrandIds: [brand._id]
      });
    }

    // get or create company
    if (companyData && companyData.name) {
      let company = await sendContactRPCMessage('findCompany', companyData);

      const {
        customFieldsData,
        trackedData
      } = await coreModels.Fields.generateCustomFieldsData(companyData, 'company');

      companyData.customFieldsData = customFieldsData;
      companyData.trackedData = trackedData;

      if (!company) {
        companyData.primaryName = companyData.name;

        try {
          company = await sendContactRPCMessage('createCompany', {
            ...companyData,
            scopeBrandIds: [brand._id]
          });
        } catch (e) {
          debug.error(e.message);
        }
      } else {
        company = await sendContactRPCMessage('updateCompany', {
          ...companyData,
          scopeBrandIds: [brand._id]
        });
      }

      if (customer && company) {
        // add company to customer's companyIds list
        sendConformityMessage('create', {
          mainType: 'customer',
          mainTypeId: customer._id,
          relType: 'company',
          relTypeId: company._id
        });
      }
    }

    return {
      integrationId: integration._id,
      uiOptions: integration.uiOptions,
      languageCode: integration.languageCode,
      messengerData: await getMessengerData(models, integration),
      customerId: customer && customer._id,
      visitorId: customer ? null : visitorId,
      brand
    };
  },
  /*
   * Create a new message
   */
  async widgetsInsertMessage(
    _root,
    args: {
      integrationId: string;
      customerId?: string;
      visitorId?: string;
      conversationId?: string;
      message: string;
      skillId?: string;
      attachments?: any[];
      contentType: string;
    },
    { models, coreModels }: IContext
  ) {
    const {
      integrationId,
      visitorId,
      conversationId,
      message,
      skillId,
      attachments,
      contentType
    } = args;

    if (contentType === MESSAGE_TYPES.VIDEO_CALL_REQUEST) {
      const videoCallRequestMessage = await models.ConversationMessages.findOne(
        { conversationId, contentType },
        { createdAt: 1 }
      ).sort({ createdAt: -1 });

      if (videoCallRequestMessage) {
        const messageTime = new Date(
          videoCallRequestMessage.createdAt
        ).getTime();

        const nowTime = new Date().getTime();

        let integrationConfigs: Array<{ code: string; value?: string }> = [];

        try {
          integrationConfigs = await sendRPCMessage('rpc_queue:api_to_integrations', {
            action: 'getConfigs'
          });

        } catch (e) {
          debug.error(e);
        }

        const timeDelay = integrationConfigs.find(
          config => config.code === 'VIDEO_CALL_TIME_DELAY_BETWEEN_REQUESTS'
        ) || { value: '0' };

        const timeDelayIntValue = parseInt(timeDelay.value || '0', 10);

        const timeDelayValue = isNaN(timeDelayIntValue) ? 0 : timeDelayIntValue;

        if (messageTime + timeDelayValue * 1000 > nowTime) {
          const defaultValue = 'Video call request has already sent';

          const messageForDelay = integrationConfigs.find(
            config => config.code === 'VIDEO_CALL_MESSAGE_FOR_TIME_DELAY'
          ) || { value: defaultValue };

          throw new Error(messageForDelay.value || defaultValue);
        }
      }
    }

    const conversationContent = strip(message || '').substring(0, 100);

    let { customerId } = args;

    if (visitorId && !customerId) {
      const customer = await createVisitor(visitorId);
      customerId = customer._id;
    }

    // customer can write a message
    // to the closed conversation even if it's closed
    let conversation;

    const integration =
      (await getDocument(models, coreModels, 'integrations', {
        _id: integrationId
      })) || {};

    const messengerData = integration.messengerData || {};

    const { botEndpointUrl, botShowInitialMessage } = messengerData;

    const HAS_BOTENDPOINT_URL = (botEndpointUrl || '').length > 0;

    if (conversationId) {
      conversation = await models.Conversations.findOne({
        _id: conversationId
      }).lean();

      conversation = await models.Conversations.findByIdAndUpdate(
        conversationId,
        {
          // mark this conversation as unread
          readUserIds: [],

          // reopen this conversation if it's closed
          status: CONVERSATION_STATUSES.OPEN
        },
        { new: true }
      );
      // create conversation
    } else {
      conversation = await models.Conversations.createConversation({
        customerId,
        integrationId,
        operatorStatus: HAS_BOTENDPOINT_URL
          ? CONVERSATION_OPERATOR_STATUS.BOT
          : CONVERSATION_OPERATOR_STATUS.OPERATOR,
        status: CONVERSATION_STATUSES.OPEN,
        content: conversationContent,
        ...(skillId ? { skillId } : {})
      });
    }

    // create message

    const msg = await models.ConversationMessages.createMessage({
      conversationId: conversation._id,
      customerId,
      attachments,
      contentType,
      content: message
    });

    await models.Conversations.updateOne(
      { _id: msg.conversationId },
      {
        $set: {
          // Reopen its conversation if it's closed
          status: CONVERSATION_STATUSES.OPEN,

          // setting conversation's content to last message
          content: conversationContent,

          // Mark as unread
          readUserIds: [],

          customerId,

          // clear visitorId
          visitorId: ''
        }
      }
    );

    // mark customer as active
    sendContactMessage('markCustomerAsActive', {
      customerId: conversation.customerId
    });

    await pConversationClientMessageInserted(models, msg);

    graphqlPubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: msg
    });

    // bot message ================
    if (
      HAS_BOTENDPOINT_URL &&
      !botShowInitialMessage &&
      conversation.operatorStatus === CONVERSATION_OPERATOR_STATUS.BOT
    ) {
      graphqlPubsub.publish('conversationBotTypingStatus', {
        conversationBotTypingStatus: {
          conversationId: msg.conversationId,
          typing: true
        }
      });

      try {
        const botRequest = await sendRequest({
          method: 'POST',
          url: `${botEndpointUrl}/${conversation._id}`,
          body: {
            type: 'text',
            text: message
          }
        });

        const { responses } = botRequest;

        const botData =
          responses.length !== 0
            ? responses
            : [
                {
                  type: 'text',
                  text: AUTO_BOT_MESSAGES.NO_RESPONSE
                }
              ];

        const botMessage = await models.ConversationMessages.createMessage({
          conversationId: conversation._id,
          customerId,
          contentType,
          botData
        });

        graphqlPubsub.publish('conversationBotTypingStatus', {
          conversationBotTypingStatus: {
            conversationId: msg.conversationId,
            typing: false
          }
        });

        graphqlPubsub.publish('conversationMessageInserted', {
          conversationMessageInserted: botMessage
        });
      } catch (e) {
        debug.error(`Failed to connect to BOTPRESS: ${e.message}`);
      }
    }

    const customerLastStatus = await get(
      `customer_last_status_${customerId}`,
      'left'
    );

    if (customerLastStatus === 'left' && customerId) {
      set(`customer_last_status_${customerId}`, 'joined');

      // customer has joined + time
      const conversationMessages = await models.Conversations.changeCustomerStatus(
        'joined',
        customerId,
        conversation.integrationId
      );

      for (const mg of conversationMessages) {
        graphqlPubsub.publish('conversationMessageInserted', {
          conversationMessageInserted: mg
        });
      }

      // notify as connected
      graphqlPubsub.publish('customerConnectionChanged', {
        customerConnectionChanged: {
          _id: customerId,
          status: 'connected'
        }
      });
    }

    if (!HAS_BOTENDPOINT_URL && customerId) {
      try {
        await sendMessage('core:sendMobileNotification', {
          title: 'You have a new message',
          body: conversationContent,
          customerId,
          conversationId: conversation._id,
          receivers: conversationNotifReceivers(conversation, customerId)
        });
      } catch (e) {
        debug.error(`Failed to send mobile notification: ${e.message}`);
      }
    }

    // ? await sendToWebhook('create', 'customerMessages', msg);

    return msg;
  },

  /*
   * Mark given conversation's messages as read
   */
  async widgetsReadConversationMessages(
    _root,
    args: { conversationId: string },
    { models }: IContext
  ) {
    await models.ConversationMessages.updateMany(
      {
        conversationId: args.conversationId,
        userId: { $exists: true },
        isCustomerRead: { $ne: true }
      },
      { isCustomerRead: true },
      { multi: true }
    );

    return args.conversationId;
  },

  async widgetsSaveCustomerGetNotified(_root, args, { models }: IContext) {
    const { visitorId, customerId } = args;

    if (visitorId && !customerId) {
      const customer = await createVisitor(visitorId);
      args.customerId = customer._id;

      await models.ConversationMessages.updateVisitorEngageMessages(
        visitorId,
        customer._id
      );
      await models.Conversations.updateMany(
        {
          visitorId
        },
        { $set: { customerId: customer._id, visitorId: '' } }
      );
    }

    return sendContactRPCMessage('saveVisitorContactInfo', args);
  },

  /*
   * Update customer location field
   */
  async widgetsSaveBrowserInfo(
    _root,
    {
      visitorId,
      customerId,
      browserInfo
    }: { visitorId?: string; customerId?: string; browserInfo: IBrowserInfo },
    { coreModels }: IContext
  ) {
    // update location

    if (customerId) {
      sendContactMessage('updateLocation', { customerId, browserInfo });
      sendContactMessage('updateSession', { customerId });
    }

    if (visitorId) {
      sendToLog('visitor:updateEntry', { visitorId, location: browserInfo });
    }

    try {
      await trackViewPageEvent(coreModels, {
        visitorId,
        customerId,
        attributes: { url: browserInfo.url }
      });
    } catch (e) {
      /* istanbul ignore next */
      debug.error(
        `Error occurred during widgets save browser info ${e.message}`
      );
    }

    return null;
  },

  widgetsSendTypingInfo(
    _root,
    args: { conversationId: string; text?: string }
  ) {
    graphqlPubsub.publish('conversationClientTypingStatusChanged', {
      conversationClientTypingStatusChanged: args
    });

    return 'ok';
  },

  async widgetsSendEmail(_root, args: IWidgetEmailParams, { coreModels }: IContext) {
    const { toEmails, fromEmail, title, content, customerId, formId } = args;

    const attachments = args.attachments || [];

    // do not use Customers.getCustomer() because it throws error if not found
    const customer = await sendContactRPCMessage('findCustomer', {
      _id: customerId
    });
    const form = await coreModels.Forms.getForm(formId || '');

    let finalContent = content;

    if (customer && form) {
      const apiService = await getService('api');

      const replacedContent = await new EditorAttributeUtil(
        msgBrokerClient,
        apiService.address,
        await getServices()
      ).replaceAttributes({
        content,
        customer,
        user: await coreModels.Users.getUser(form.createdUserId)
      });

      finalContent = replacedContent || '';
    }

    let mailAttachment: any = [];

    if (attachments.length > 0) {
      mailAttachment = attachments.map(file => {
        return {
          filename: file.name || '',
          path: file.url || ''
        };
      });
    }

    await sendMessage('core:sendEmail', {
      toEmails,
      fromEmail,
      title,
      template: { data: { content: finalContent } },
      attachments: mailAttachment
    });
  },

  async widgetBotRequest(
    _root,
    {
      integrationId,
      conversationId,
      customerId,
      visitorId,
      message,
      payload,
      type
    }: {
      conversationId?: string;
      customerId?: string;
      visitorId?: string;
      integrationId: string;
      message: string;
      payload: string;
      type: string;
    },
    { models, coreModels }: IContext
  ) {
    const integration =
      (await getDocument(models, coreModels, 'integrations', {
        _id: integrationId
      })) || {};

    const { botEndpointUrl } = integration.messengerData;

    if (visitorId && !customerId) {
      const customer = await createVisitor(visitorId);
      customerId = customer._id;
    }

    let sessionId = conversationId;

    if (!conversationId) {
      sessionId = await get(`bot_initial_message_session_id_${integrationId}`);

      const conversation = await models.Conversations.createConversation({
        customerId,
        integrationId,
        operatorStatus: CONVERSATION_OPERATOR_STATUS.BOT,
        status: CONVERSATION_STATUSES.CLOSED
      });

      conversationId = conversation._id;

      const initialMessageBotData = await get(
        `bot_initial_message_${integrationId}`
      );

      await models.ConversationMessages.createMessage({
        conversationId: conversation._id,
        customerId,
        botData: JSON.parse(initialMessageBotData || '{}')
      });
    }

    // create customer message
    const msg = await models.ConversationMessages.createMessage({
      conversationId,
      customerId,
      content: message
    });

    graphqlPubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: msg
    });

    let botMessage;
    let botData;

    if (type !== BOT_MESSAGE_TYPES.SAY_SOMETHING) {
      const botRequest = await sendRequest({
        method: 'POST',
        url: `${botEndpointUrl}/${sessionId}`,
        body: {
          type: 'text',
          text: payload
        }
      });

      const { responses } = botRequest;

      botData =
        responses.length !== 0
          ? responses
          : [
              {
                type: 'text',
                text: AUTO_BOT_MESSAGES.NO_RESPONSE
              }
            ];
    } else {
      botData = [
        {
          type: 'text',
          text: payload
        }
      ];
    }

    // create bot message
    botMessage = await models.ConversationMessages.createMessage({
      conversationId,
      customerId,
      botData
    });

    graphqlPubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: botMessage
    });

    return botMessage;
  },

  async widgetGetBotInitialMessage(
    _root,
    { integrationId }: { integrationId: string },
    { models, coreModels }: IContext
  ) {
    const sessionId = `_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await set(`bot_initial_message_session_id_${integrationId}`, sessionId);

    const integration =
      (await getDocument(models, coreModels, 'integrations', {
        _id: integrationId
      })) || {};

    const { botEndpointUrl } = integration.messengerData;

    const botRequest = await sendRequest({
      method: 'POST',
      url: `${botEndpointUrl}/${sessionId}`,
      body: {
        type: 'text',
        text: 'getStarted'
      }
    });

    await set(
      `bot_initial_message_${integrationId}`,
      JSON.stringify(botRequest.responses)
    );

    return { botData: botRequest.responses };
  },
  // Find integration
  async widgetsBookingConnect(_root, { _id }: { _id: string }, { models }: IContext) {
    const integration = await models.Integrations.getIntegration({
      _id,
      isActive: true
    });

    await models.Integrations.increaseBookingViewCount(_id);

    return integration;
  },

  // create new booking conversation using form data
  async widgetsSaveBooking(
    _root,
    args: {
      integrationId: string;
      formId: string;
      //       submissions: ISubmission[];
      submissions: any[];
      browserInfo: any;
      cachedCustomerId?: string;
      productId: string;
    },
    { models, coreModels }: IContext
  ) {
    const { submissions, productId } = args;

    const product = await sendProductRPCMessage('findOne', { _id: productId });

    return createFormConversation(
      models,
      coreModels,
      args,
      () => {
        return `<p>submitted a new booking for <strong><a href="/settings/product-service/details/${productId}">${product?.name}</a> ${product?.code}</strong></p>`;
      },
      () => {
        return {
          conversation: {
            bookingProductId: product._id
          },
          message: {
            bookingWidgetData: {
              formWidgetData: submissions,
              productId,
              content: product.name
            }
          }
        };
      },
      'booking',
    );
  }
};

export default widgetMutations;