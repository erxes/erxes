import * as strip from 'strip';
import {
  Brands,
  Companies,
  Conformities,
  Conversations,
  Customers,
  Forms,
  FormSubmissions,
  Integrations,
  KnowledgeBaseArticles,
  MessengerApps,
  Users
} from '../../../db/models';
import Messages from '../../../db/models/ConversationMessages';
import {
  IBrowserInfo,
  IVisitorContactInfoParams
} from '../../../db/models/Customers';
import {
  CONVERSATION_OPERATOR_STATUS,
  CONVERSATION_STATUSES
} from '../../../db/models/definitions/constants';
import {
  IIntegrationDocument,
  IMessengerDataMessagesItem
} from '../../../db/models/definitions/integrations';
import {
  IKnowledgebaseCredentials,
  ILeadCredentials
} from '../../../db/models/definitions/messengerApps';
import { debugBase } from '../../../debuggers';
import { trackViewPageEvent } from '../../../events';
import memoryStorage from '../../../inmemoryStorage';
import { graphqlPubsub } from '../../../pubsub';
import { AUTO_BOT_MESSAGES, BOT_MESSAGE_TYPES } from '../../constants';
import {
  registerOnboardHistory,
  sendEmail,
  sendMobileNotification,
  sendRequest,
  sendToWebhook
} from '../../utils';
import { getOrCreateEngageMessage } from '../../widgetUtils';
import { conversationNotifReceivers } from './conversations';

interface ISubmission {
  _id: string;
  value: any;
  type?: string;
  validation?: string;
}

interface IWidgetEmailParams {
  toEmails: string[];
  fromEmail: string;
  title: string;
  content: string;
}

export const getMessengerData = async (integration: IIntegrationDocument) => {
  let messagesByLanguage: IMessengerDataMessagesItem | null = null;
  let messengerData = integration.messengerData;

  if (messengerData) {
    messengerData = messengerData.toJSON();

    const languageCode = integration.languageCode || 'en';
    const messages = (messengerData || {}).messages;

    if (messages) {
      messagesByLanguage = messages[languageCode];
    }
  }

  // knowledgebase app =======
  const kbApp = await MessengerApps.findOne({
    kind: 'knowledgebase',
    'credentials.integrationId': integration._id
  });

  const topicId =
    kbApp && kbApp.credentials
      ? (kbApp.credentials as IKnowledgebaseCredentials).topicId
      : null;

  // lead app ==========
  const leadApp = await MessengerApps.findOne({
    kind: 'lead',
    'credentials.integrationId': integration._id
  });

  const formCode =
    leadApp && leadApp.credentials
      ? (leadApp.credentials as ILeadCredentials).formCode
      : null;

  // website app ============
  const websiteApps = await MessengerApps.find({
    kind: 'website',
    'credentials.integrationId': integration._id
  });

  return {
    ...(messengerData || {}),
    messages: messagesByLanguage,
    knowledgeBaseTopicId: topicId,
    websiteApps,
    formCode
  };
};

const widgetMutations = {
  // Find integrationId by brandCode
  async widgetsLeadConnect(
    _root,
    args: { brandCode: string; formCode: string; cachedCustomerId?: string }
  ) {
    const brand = await Brands.findOne({ code: args.brandCode });
    const form = await Forms.findOne({ code: args.formCode });

    if (!brand || !form) {
      throw new Error('Invalid configuration');
    }

    // find integration by brandId & formId
    const integ = await Integrations.findOne({
      brandId: brand._id,
      formId: form._id
    });

    if (!integ) {
      throw new Error('Integration not found');
    }

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
        integrationId: integ.id
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
    const {
      integrationId,
      formId,
      submissions,
      browserInfo,
      cachedCustomerId
    } = args;

    const form = await Forms.findOne({ _id: formId });

    if (!form) {
      throw new Error('Form not found');
    }

    const errors = await Forms.validate(formId, submissions);

    if (errors.length > 0) {
      return { status: 'error', errors };
    }

    const content = form.title;

    let email;
    let phone;
    let firstName = '';
    let lastName = '';

    submissions.forEach(submission => {
      if (submission.type === 'email') {
        email = submission.value;
      }

      if (submission.type === 'phone') {
        phone = submission.value;
      }

      if (submission.type === 'firstName') {
        firstName = submission.value;
      }

      if (submission.type === 'lastName') {
        lastName = submission.value;
      }
    });

    // get or create customer
    let customer = await Customers.getWidgetCustomer({
      integrationId,
      email,
      phone,
      cachedCustomerId
    });

    if (!customer) {
      customer = await Customers.createCustomer({
        integrationId,
        primaryEmail: email,
        emails: [email],
        firstName,
        lastName,
        primaryPhone: phone
      });
    }

    const customerDoc = {
      location: browserInfo,
      firstName: customer.firstName || firstName,
      lastName: customer.lastName || lastName,
      ...(customer.primaryEmail
        ? {}
        : {
            emails: [email],
            primaryEmail: email
          }),
      ...(customer.primaryPhone
        ? {}
        : {
            phones: [phone],
            primaryPhone: phone
          })
    };

    // update location info and missing fields
    await Customers.updateCustomer(customer._id, customerDoc);

    // Inserting customer id into submitted customer ids
    const doc = {
      formId,
      customerId: customer._id,
      submittedAt: new Date()
    };

    await FormSubmissions.createFormSubmission(doc);

    // create conversation
    const conversation = await Conversations.createConversation({
      integrationId,
      customerId: customer._id,
      content
    });

    // create message
    const message = await Messages.createMessage({
      conversationId: conversation._id,
      customerId: customer._id,
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
      customer: customerDoc,
      cachedCustomerId: args.cachedCustomerId
    });

    return { status: 'ok', messageId: message._id };
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
      deviceToken
    } = args;

    const customData = data;

    // find brand
    const brand = await Brands.findOne({ code: brandCode });

    if (!brand) {
      throw new Error('Brand not found');
    }

    // find integration
    const integration = await Integrations.getWidgetIntegration(
      brandCode,
      'messenger'
    );

    if (!integration) {
      throw new Error('Integration not found');
    }

    let customer = await Customers.getWidgetCustomer({
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
      deviceToken
    };

    customer = customer
      ? await Customers.updateMessengerCustomer({
          _id: customer._id,
          doc,
          customData
        })
      : await Customers.createMessengerCustomer({ doc, customData });

    // get or create company
    if (companyData && companyData.name) {
      let company = await Companies.findOne({
        $or: [
          { names: { $in: [companyData.name] } },
          { primaryName: companyData.name }
        ]
      });

      if (!company) {
        companyData.primaryName = companyData.name;
        companyData.names = [companyData.name];

        company = await Companies.createCompany({
          ...companyData,
          scopeBrandIds: [brand._id]
        });
      }

      // add company to customer's companyIds list
      await Conformities.create({
        mainType: 'customer',
        mainTypeId: customer._id,
        relType: 'company',
        relTypeId: company._id
      });
    }

    if (integration.createdUserId) {
      const user = await Users.getUser(integration.createdUserId);

      registerOnboardHistory({ type: 'messengerIntegrationInstalled', user });
    }

    return {
      integrationId: integration._id,
      uiOptions: integration.uiOptions,
      languageCode: integration.languageCode,
      messengerData: await getMessengerData(integration),
      customerId: customer._id,
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
      customerId: string;
      conversationId?: string;
      message: string;
      attachments?: any[];
      contentType: string;
    }
  ) {
    const {
      integrationId,
      customerId,
      conversationId,
      message,
      attachments,
      contentType
    } = args;

    const conversationContent = strip(message || '').substring(0, 100);

    // customer can write a message
    // to the closed conversation even if it's closed
    let conversation;

    const integration = await Integrations.findOne({
      _id: integrationId
    }).lean();

    const messengerData = integration.messengerData || {};

    const { botEndpointUrl } = messengerData;

    let HAS_BOTENDPOINT_URL = (botEndpointUrl || '').length > 0;

    const getConversationStatus = (IS_CONVERSATION_OPERATOR?: boolean) => {
      const { OPEN, CLOSED } = CONVERSATION_STATUSES;

      if (IS_CONVERSATION_OPERATOR) {
        HAS_BOTENDPOINT_URL = false;
      }

      return !HAS_BOTENDPOINT_URL || IS_CONVERSATION_OPERATOR ? OPEN : CLOSED;
    };

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
          status: getConversationStatus(
            conversation.operatorStatus !== CONVERSATION_OPERATOR_STATUS.BOT
          )
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
        status: getConversationStatus(),
        content: conversationContent
      });
    }

    const defaultBotData =
      getConversationStatus(
        conversation.operatorStatus !== CONVERSATION_OPERATOR_STATUS.BOT
      ) === CONVERSATION_STATUSES.OPEN
        ? null
        : [];

    // create message
    const msg = await Messages.createMessage({
      conversationId: conversation._id,
      customerId,
      attachments,
      contentType,
      botData: defaultBotData,
      content: message
    });

    await Conversations.updateOne(
      { _id: msg.conversationId },
      {
        $set: {
          // Reopen its conversation if it's closed
          status: getConversationStatus(),

          // setting conversation's content to last message
          content: conversationContent,

          // Mark as unread
          readUserIds: []
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
    if (HAS_BOTENDPOINT_URL) {
      graphqlPubsub.publish('conversationBotTypingStatus', {
        conversationBotTypingStatus: {
          conversationId: msg.conversationId,
          typing: true
        }
      });

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

      graphqlPubsub.publish('conversationClientMessageInserted', {
        conversationClientMessageInserted: botMessage
      });
      graphqlPubsub.publish('conversationMessageInserted', {
        conversationMessageInserted: botMessage
      });
    }

    const customerLastStatus = await memoryStorage().get(
      `customer_last_status_${customerId}`,
      'left'
    );

    if (customerLastStatus === 'left') {
      memoryStorage().set(`customer_last_status_${customerId}`, 'joined');

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

    if (!HAS_BOTENDPOINT_URL) {
      sendMobileNotification({
        title: 'You have a new message',
        body: conversationContent,
        customerId,
        conversationId: conversation._id,
        receivers: conversationNotifReceivers(conversation, customerId)
      });
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

  widgetsSaveCustomerGetNotified(_root, args: IVisitorContactInfoParams) {
    return Customers.saveVisitorContactInfo(args);
  },

  /*
   * Update customer location field
   */
  async widgetsSaveBrowserInfo(
    _root,
    {
      customerId,
      browserInfo
    }: { customerId: string; browserInfo: IBrowserInfo }
  ) {
    // update location
    await Customers.updateLocation(customerId, browserInfo);

    try {
      await trackViewPageEvent({
        customerId,
        attributes: { url: browserInfo.url }
      });
    } catch (e) {
      /* istanbul ignore next */
      debugBase(`Error occurred during widgets save browser info ${e.message}`);
    }

    await Customers.updateSession(customerId);

    return await getOrCreateEngageMessage(customerId, browserInfo);
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
    const { toEmails, fromEmail, title, content } = args;

    await sendEmail({
      toEmails,
      fromEmail,
      title,
      template: { data: { content } }
    });
  },

  async widgetBotRequest(
    _root,
    {
      integrationId,
      conversationId,
      customerId,
      message,
      payload,
      type
    }: {
      conversationId?: string;
      customerId: string;
      integrationId: string;
      message: string;
      payload: string;
      type: string;
    }
  ) {
    const integration = await Integrations.findOne({
      _id: integrationId
    }).lean();

    const { botEndpointUrl } = integration.messengerData;

    let sessionId = conversationId;

    if (!conversationId) {
      sessionId = await memoryStorage().get(
        `bot_initial_message_session_id_${integrationId}`
      );

      const conversation = await Conversations.createConversation({
        customerId,
        integrationId,
        operatorStatus: CONVERSATION_OPERATOR_STATUS.BOT,
        status: CONVERSATION_STATUSES.CLOSED
      });

      conversationId = conversation._id;

      const initialMessageBotData = await memoryStorage().get(
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
      botData: [],
      content: message
    });

    graphqlPubsub.publish('conversationClientMessageInserted', {
      conversationClientMessageInserted: msg
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

    graphqlPubsub.publish('conversationClientMessageInserted', {
      conversationClientMessageInserted: botMessage
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

    await memoryStorage().set(
      `bot_initial_message_session_id_${integrationId}`,
      sessionId
    );

    const integration = await Integrations.findOne({
      _id: integrationId
    }).lean();

    const { botEndpointUrl } = integration.messengerData;

    const botRequest = await sendRequest({
      method: 'POST',
      url: `${botEndpointUrl}/${sessionId}`,
      body: {
        type: 'text',
        text: 'getStarted'
      }
    });

    await memoryStorage().set(
      `bot_initial_message_${integrationId}`,
      JSON.stringify(botRequest.responses)
    );

    return { botData: botRequest.responses };
  }
};

export default widgetMutations;
