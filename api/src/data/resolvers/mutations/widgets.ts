import * as strip from 'strip';
import {
  Bookings,
  Companies,
  Conformities,
  ConversationMessages,
  Conversations,
  Customers,
  Fields,
  Forms,
  Integrations,
  KnowledgeBaseArticles,
  Users
} from '../../../db/models';
import Messages from '../../../db/models/ConversationMessages';
import {
  IBrowserInfo,
  IVisitorContactInfoParams
} from '../../../db/models/Customers';
import {
  CONVERSATION_OPERATOR_STATUS,
  CONVERSATION_STATUSES,
  KIND_CHOICES,
  MESSAGE_TYPES
} from '../../../db/models/definitions/constants';
import { ISubmission } from '../../../db/models/definitions/fields';
import {
  IAttachment,
  IIntegrationDocument,
  IMessengerDataMessagesItem
} from '../../../db/models/definitions/integrations';
import { IKnowledgebaseCredentials } from '../../../db/models/definitions/messengerApps';
import { debugError } from '../../../debuggers';
import { trackViewPageEvent } from '../../../events';
import { get, set } from '../../../inmemoryStorage';
import { graphqlPubsub } from '../../../pubsub';
import { AUTO_BOT_MESSAGES, BOT_MESSAGE_TYPES } from '../../constants';
import { sendToVisitorLog } from '../../logUtils';
import { IContext } from '../../types';
import {
  findCompany,
  registerOnboardHistory,
  replaceEditorAttributes,
  sendEmail,
  sendMobileNotification,
  sendRequest,
  sendToWebhook
} from '../../utils';
import { convertVisitorToCustomer, solveSubmissions } from '../../widgetUtils';
import { getDocument, getMessengerApps } from './cacheUtils';
import { conversationNotifReceivers } from './conversations';

interface IWidgetEmailParams {
  toEmails: string[];
  fromEmail: string;
  title: string;
  content: string;
  customerId?: string;
  formId?: string;
  attachments?: IAttachment[];
}

export const getMessengerData = async (integration: IIntegrationDocument) => {
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
  const kbApp = await getMessengerApps('knowledgebase', integration._id);

  const topicId =
    kbApp && kbApp.credentials
      ? (kbApp.credentials as IKnowledgebaseCredentials).topicId
      : null;

  // lead app ==========
  const leadApps = await getMessengerApps('lead', integration._id, false);

  const formCodes = [] as string[];

  for (const app of leadApps) {
    if (app && app.credentials) {
      formCodes.push(app.credentials.formCode);
    }
  }

  // website app ============
  const websiteApps = await getMessengerApps('website', integration._id, false);

  return {
    ...(messengerData || {}),
    messages: messagesByLanguage,
    knowledgeBaseTopicId: topicId,
    websiteApps,
    formCodes
  };
};

const widgetMutations = {
  // Find integrationId by brandCode
  async widgetsLeadConnect(
    _root,
    args: { brandCode: string; formCode: string; cachedCustomerId?: string }
  ) {
    const brand = await getDocument('brands', { code: args.brandCode });

    const form = await Forms.findOne({ code: args.formCode });

    if (!brand || !form) {
      throw new Error('Invalid configuration');
    }

    // find integration by brandId & formId
    const integ = await Integrations.getIntegration({
      brandId: brand._id,
      formId: form._id,
      isActive: true
    });

    if (integ.leadData && integ.leadData.loadType === 'embedded') {
      await Integrations.increaseViewCount(form._id);
    }

    if (integ.createdUserId) {
      const user = await Users.getUser(integ.createdUserId);

      registerOnboardHistory({ type: 'leadIntegrationInstalled', user });
    }

    if (integ.leadData?.isRequireOnce && args.cachedCustomerId) {
      const conversation = await Conversations.findOne({
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
      submissions: ISubmission[];
      browserInfo: any;
      cachedCustomerId?: string;
    }
  ) {
    const { integrationId, formId, submissions } = args;

    const form = await Forms.findOne({ _id: formId });

    if (!form) {
      throw new Error('Form not found');
    }

    const errors = await Forms.validate(formId, submissions);

    if (errors.length > 0) {
      return { status: 'error', errors };
    }

    const content = form.title;

    const cachedCustomer = await solveSubmissions(args);

    // create conversation
    const conversation = await Conversations.createConversation({
      integrationId,
      customerId: cachedCustomer._id,
      content
    });

    // create message
    const message = await Messages.createMessage({
      conversationId: conversation._id,
      customerId: cachedCustomer._id,
      content,
      formWidgetData: submissions
    });

    // increasing form submitted count
    await Integrations.increaseContactsGathered(formId);

    graphqlPubsub.publish('conversationClientMessageInserted', {
      conversationClientMessageInserted: message
    });

    graphqlPubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: message
    });

    await sendToWebhook('create', 'popupSubmitted', {
      formId: args.formId,
      submissions: args.submissions,
      customer: cachedCustomer,
      cachedCustomerId: cachedCustomer._id,
      conversationId: conversation._id
    });

    return {
      status: 'ok',
      messageId: message._id,
      customerId: cachedCustomer._id
    };
  },

  widgetsLeadIncreaseViewCount(_root, { formId }: { formId: string }) {
    return Integrations.increaseViewCount(formId);
  },

  widgetsKnowledgebaseIncReactionCount(
    _root,
    { articleId, reactionChoice }: { articleId: string; reactionChoice: string }
  ) {
    return KnowledgeBaseArticles.incReactionCount(articleId, reactionChoice);
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
    }
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
    const brand = await getDocument('brands', { code: brandCode });

    if (!brand) {
      throw new Error('Invalid configuration');
    }

    // find integration
    const integration = await getDocument('integrations', {
      brandId: brand._id,
      kind: KIND_CHOICES.MESSENGER
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    let customer;

    if (cachedCustomerId || email || phone || code) {
      customer = await Customers.getWidgetCustomer({
        integrationId: integration._id,
        cachedCustomerId,
        email,
        phone,
        code
      });

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
        ? await Customers.updateMessengerCustomer({
            _id: customer._id,
            doc,
            customData
          })
        : await Customers.createMessengerCustomer({ doc, customData });
    }

    if (visitorId) {
      await sendToVisitorLog(
        {
          visitorId,
          integrationId: integration._id,
          scopeBrandIds: [brand._id]
        },
        'createOrUpdate'
      );
    }

    // get or create company
    if (companyData && companyData.name) {
      let company = await findCompany(companyData);

      const {
        customFieldsData,
        trackedData
      } = await Fields.generateCustomFieldsData(companyData, 'company');

      companyData.customFieldsData = customFieldsData;
      companyData.trackedData = trackedData;

      if (!company) {
        companyData.primaryName = companyData.name;

        try {
          company = await Companies.createCompany({
            ...companyData,
            scopeBrandIds: [brand._id]
          });
        } catch (e) {
          debugError(e.message);
        }
      } else {
        company = await Companies.updateCompany(company._id, {
          ...companyData,
          scopeBrandIds: [brand._id]
        });
      }

      if (customer && company) {
        // add company to customer's companyIds list
        await Conformities.create({
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
      messengerData: await getMessengerData(integration),
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
    { dataSources }: IContext
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
      const videoCallRequestMessage = await ConversationMessages.findOne(
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
          integrationConfigs = await dataSources.IntegrationsAPI.fetchApi(
            '/configs'
          );
        } catch (e) {
          debugError(e);
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
      const customer = await convertVisitorToCustomer(visitorId);
      customerId = customer._id;
    }

    // customer can write a message
    // to the closed conversation even if it's closed
    let conversation;

    const integration =
      (await getDocument('integrations', {
        _id: integrationId
      })) || {};

    const messengerData = integration.messengerData || {};

    const { botEndpointUrl, botShowInitialMessage } = messengerData;

    const HAS_BOTENDPOINT_URL = (botEndpointUrl || '').length > 0;

    if (conversationId) {
      conversation = await Conversations.findOne({
        _id: conversationId
      }).lean();

      conversation = await Conversations.findByIdAndUpdate(
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
      conversation = await Conversations.createConversation({
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

    const msg = await Messages.createMessage({
      conversationId: conversation._id,
      customerId,
      attachments,
      contentType,
      content: message
    });

    await Conversations.updateOne(
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
    await Customers.markCustomerAsActive(conversation.customerId);

    graphqlPubsub.publish('conversationClientMessageInserted', {
      conversationClientMessageInserted: msg
    });

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

        const botMessage = await Messages.createMessage({
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
        debugError(`Failed to connect to BOTPRESS: ${e.message}`);
      }
    }

    const customerLastStatus = await get(
      `customer_last_status_${customerId}`,
      'left'
    );

    if (customerLastStatus === 'left' && customerId) {
      set(`customer_last_status_${customerId}`, 'joined');

      // customer has joined + time
      const conversationMessages = await Conversations.changeCustomerStatus(
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
        sendMobileNotification({
          title: 'You have a new message',
          body: conversationContent,
          customerId,
          conversationId: conversation._id,
          receivers: conversationNotifReceivers(conversation, customerId)
        });
      } catch (e) {
        debugError(`Failed to send mobile notification: ${e.message}`);
      }
    }

    await sendToWebhook('create', 'customerMessages', msg);

    return msg;
  },

  /*
   * Mark given conversation's messages as read
   */
  async widgetsReadConversationMessages(
    _root,
    args: { conversationId: string }
  ) {
    await Messages.updateMany(
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

  async widgetsSaveCustomerGetNotified(_root, args: IVisitorContactInfoParams) {
    if (args.visitorId && !args.customerId) {
      const customer = await convertVisitorToCustomer(args.visitorId);
      args.customerId = customer._id;
    }

    return Customers.saveVisitorContactInfo(args);
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
    }: { visitorId?: string; customerId?: string; browserInfo: IBrowserInfo }
  ) {
    // update location

    if (customerId) {
      const customer = await Customers.updateLocation(customerId, browserInfo);
      await Customers.updateSession(customer._id);
    }

    if (visitorId) {
      await sendToVisitorLog({ visitorId, location: browserInfo }, 'update');
    }

    try {
      await trackViewPageEvent({
        visitorId,
        customerId,
        attributes: { url: browserInfo.url }
      });
    } catch (e) {
      /* istanbul ignore next */
      debugError(
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

  async widgetsSendEmail(_root, args: IWidgetEmailParams) {
    const { toEmails, fromEmail, title, content, customerId, formId } = args;

    const attachments = args.attachments || [];

    // do not use Customers.getCustomer() because it throws error if not found
    const customer = await Customers.findOne({ _id: customerId });
    const form = await Forms.getForm(formId || '');

    let finalContent = content;

    if (customer && form) {
      const { customerFields } = await replaceEditorAttributes({
        content
      });

      const { replacedContent } = await replaceEditorAttributes({
        content,
        customerFields,
        customer,
        user: await Users.getUser(form.createdUserId)
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

    await sendEmail({
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
    }
  ) {
    const integration =
      (await getDocument('integrations', {
        _id: integrationId
      })) || {};

    const { botEndpointUrl } = integration.messengerData;

    if (visitorId && !customerId) {
      const customer = await convertVisitorToCustomer(visitorId);

      customerId = customer._id;
    }

    let sessionId = conversationId;

    if (!conversationId) {
      sessionId = await get(`bot_initial_message_session_id_${integrationId}`);

      const conversation = await Conversations.createConversation({
        customerId,
        integrationId,
        operatorStatus: CONVERSATION_OPERATOR_STATUS.BOT,
        status: CONVERSATION_STATUSES.CLOSED
      });

      conversationId = conversation._id;

      const initialMessageBotData = await get(
        `bot_initial_message_${integrationId}`
      );

      await Messages.createMessage({
        conversationId: conversation._id,
        customerId,
        botData: JSON.parse(initialMessageBotData || '{}')
      });
    }

    // create customer message
    const msg = await Messages.createMessage({
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
    botMessage = await Messages.createMessage({
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
    { integrationId }: { integrationId: string }
  ) {
    const sessionId = `_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await set(`bot_initial_message_session_id_${integrationId}`, sessionId);

    const integration =
      (await getDocument('integrations', {
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
  widgetsBookingIncreaseViewCount(_root, { _id }: { _id: string }) {
    return Bookings.increaseViewCount(_id);
  },
  // Find integration
  async widgetsBookingConnect(_root, { _id }: { _id: string }) {
    return Integrations.findOne({ _id });
  }
};

export default widgetMutations;
