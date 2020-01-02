import * as strip from 'strip';
import {
  Brands,
  Companies,
  Conformities,
  Conversations,
  Customers,
  EngageMessages,
  Forms,
  FormSubmissions,
  Integrations,
  KnowledgeBaseArticles,
  MessengerApps,
} from '../../../db/models';
import Messages from '../../../db/models/ConversationMessages';
import { IBrowserInfo, IVisitorContactInfoParams } from '../../../db/models/Customers';
import { CONVERSATION_STATUSES } from '../../../db/models/definitions/constants';
import { IIntegrationDocument, IMessengerDataMessagesItem } from '../../../db/models/definitions/integrations';
import { IKnowledgebaseCredentials, ILeadCredentials } from '../../../db/models/definitions/messengerApps';
import { graphqlPubsub } from '../../../pubsub';

interface ISubmission {
  _id: string;
  value: any;
  type?: string;
  validation?: string;
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
    'credentials.integrationId': integration._id,
  });

  const topicId = kbApp && kbApp.credentials ? (kbApp.credentials as IKnowledgebaseCredentials).topicId : null;

  // lead app ==========
  const leadApp = await MessengerApps.findOne({ kind: 'lead', 'credentials.integrationId': integration._id });

  const formCode = leadApp && leadApp.credentials ? (leadApp.credentials as ILeadCredentials).formCode : null;

  // website app ============
  const websiteApp = await MessengerApps.findOne({
    kind: 'website',
    'credentials.integrationId': integration._id,
  });

  const websiteAppData = websiteApp && websiteApp.credentials;

  return {
    ...(messengerData || {}),
    messages: messagesByLanguage,
    knowledgeBaseTopicId: topicId,
    websiteAppData,
    formCode,
  };
};

const widgetMutations = {
  // Find integrationId by brandCode
  async widgetsLeadConnect(_root, args: { brandCode: string; formCode: string }) {
    const brand = await Brands.findOne({ code: args.brandCode });
    const form = await Forms.findOne({ code: args.formCode });

    if (!brand || !form) {
      throw new Error('Invalid configuration');
    }

    // find integration by brandId & formId
    const integ = await Integrations.findOne({
      brandId: brand._id,
      formId: form._id,
    });

    if (!integ) {
      throw new Error('Integration not found');
    }

    if (integ.leadData && integ.leadData.loadType === 'embedded') {
      await Integrations.increaseViewCount(form._id);
    }

    // notify main api
    graphqlPubsub.publish('leadInstalled', { integrationId: integ._id });

    // return integration details
    return {
      integration: integ,
      form,
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
    },
  ) {
    const { integrationId, formId, submissions, browserInfo } = args;

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
    let customer = await Customers.getWidgetCustomer({ email });

    if (!customer) {
      customer = await Customers.createCustomer({
        integrationId,
        primaryEmail: email,
        firstName,
        lastName,
        primaryPhone: phone,
      });
    }

    await Customers.updateLocation(customer._id, browserInfo);

    // Inserting customer id into submitted customer ids
    const doc = {
      formId,
      customerId: customer._id,
      submittedAt: new Date(),
    };

    FormSubmissions.createFormSubmission(doc);

    // create conversation
    const conversation = await Conversations.createConversation({
      integrationId,
      customerId: customer._id,
      content,
    });

    // create message
    const message = await Messages.createMessage({
      conversationId: conversation._id,
      customerId: customer._id,
      content,
      formWidgetData: submissions,
    });

    // increasing form submitted count
    await Integrations.increaseContactsGathered(formId);

    graphqlPubsub.publish('conversationClientMessageInserted', {
      conversationClientMessageInserted: message,
    });

    graphqlPubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: message,
    });

    return { status: 'ok', messageId: message._id };
  },

  widgetsLeadIncreaseViewCount(_root, { formId }: { formId: string }) {
    return Integrations.increaseViewCount(formId);
  },

  widgetsKnowledgebaseIncReactionCount(
    _root,
    { articleId, reactionChoice }: { articleId: string; reactionChoice: string },
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
    },
  ) {
    const { brandCode, email, phone, code, isUser, companyData, data, cachedCustomerId, deviceToken } = args;

    const customData = data;

    // find brand
    const brand = await Brands.findOne({ code: brandCode });

    if (!brand) {
      throw new Error('Brand not found');
    }

    // find integration
    const integration = await Integrations.getWidgetIntegration(brandCode, 'messenger');

    if (!integration) {
      throw new Error('Integration not found');
    }

    let customer = await Customers.getWidgetCustomer({
      cachedCustomerId,
      email,
      phone,
      code,
    });

    if (customer) {
      // update prev customer
      customer = await Customers.updateMessengerCustomer({
        _id: customer._id,
        doc: {
          email,
          phone,
          code,
          isUser,
          deviceToken,
        },
        customData,
      });

      // create new customer
    } else {
      customer = await Customers.createMessengerCustomer(
        {
          integrationId: integration._id,
          email,
          phone,
          code,
          isUser,
          deviceToken,
        },
        customData,
      );
    }

    // get or create company
    if (companyData) {
      let company = await Companies.findOne({
        $or: [{ names: { $in: [companyData.name] } }, { primaryName: companyData.name }],
      });

      if (!company) {
        company = await Companies.createCompany({ ...companyData, scopeBrandIds: [brand._id] });
      }

      // add company to customer's companyIds list
      await Conformities.create({
        mainType: 'customer',
        mainTypeId: customer._id,
        relType: 'company',
        relTypeId: company._id,
      });
    }

    return {
      integrationId: integration._id,
      uiOptions: integration.uiOptions,
      languageCode: integration.languageCode,
      messengerData: await getMessengerData(integration),
      customerId: customer._id,
      brand,
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
    },
  ) {
    const { integrationId, customerId, conversationId, message, attachments } = args;

    const conversationContent = strip(message || '').substring(0, 100);

    // customer can write a message
    // to the closed conversation even if it's closed
    let conversation;

    if (conversationId) {
      conversation = await Conversations.findByIdAndUpdate(
        conversationId,
        {
          // mark this conversation as unread
          readUserIds: [],

          // reopen this conversation if it's closed
          status: CONVERSATION_STATUSES.OPEN,
        },
        { new: true },
      );
      // create conversation
    } else {
      conversation = await Conversations.createConversation({
        customerId,
        integrationId,
        content: conversationContent,
      });
    }

    // create message
    const msg = await Messages.createMessage({
      conversationId: conversation._id,
      customerId,
      content: message,
      attachments,
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
        },
      },
    );

    // mark customer as active
    await Customers.markCustomerAsActive(conversation.customerId);

    graphqlPubsub.publish('conversationClientMessageInserted', { conversationClientMessageInserted: msg });
    graphqlPubsub.publish('conversationMessageInserted', { conversationMessageInserted: msg });
    graphqlPubsub.publish('conversationClientTypingStatusChanged', {
      conversationClientTypingStatusChanged: { conversationId, text: '' },
    });

    return msg;
  },

  /*
   * Mark given conversation's messages as read
   */
  async widgetsReadConversationMessages(_root, args: { conversationId: string }) {
    await Messages.updateMany(
      {
        conversationId: args.conversationId,
        userId: { $exists: true },
        isCustomerRead: { $ne: true },
      },
      { isCustomerRead: true },
      { multi: true },
    );

    return args.conversationId;
  },

  widgetsSaveCustomerGetNotified(_root, args: IVisitorContactInfoParams) {
    return Customers.saveVisitorContactInfo(args);
  },

  /*
   * Update customer location field
   */
  async widgetsSaveBrowserInfo(_root, { customerId, browserInfo }: { customerId: string; browserInfo: IBrowserInfo }) {
    // update location
    await Customers.updateLocation(customerId, browserInfo);

    // update messenger session data
    const customer = await Customers.updateMessengerSession(customerId, browserInfo.url || '');

    // Preventing from displaying non messenger integrations like form's messages
    // as last unread message
    const integration = await Integrations.findOne({
      _id: customer.integrationId,
      kind: 'messenger',
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    const brand = await Brands.findOne({ _id: integration.brandId });

    if (!brand) {
      throw new Error('Brand not found');
    }

    // try to create engage chat auto messages
    if (!customer.primaryEmail) {
      await EngageMessages.createVisitorMessages({
        brand,
        integration,
        customer,
        browserInfo,
      });
    }

    // find conversations
    const convs = await Conversations.find({
      integrationId: integration._id,
      customerId: customer._id,
    });

    return Messages.findOne(Conversations.widgetsUnreadMessagesQuery(convs));
  },

  widgetsSendTypingInfo(_root, args: { conversationId: string; text?: string }) {
    graphqlPubsub.publish('conversationClientTypingStatusChanged', {
      conversationClientTypingStatusChanged: args,
    });

    return 'ok';
  },
};

export default widgetMutations;
