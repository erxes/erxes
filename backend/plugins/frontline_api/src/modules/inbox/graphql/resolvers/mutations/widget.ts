import crypto from 'crypto';
import {
  IAttachment,
  IBrowserInfo,
  IPropertyField,
  Resolver,
} from 'erxes-api-shared/core-types';
import { sendAutomationTrigger } from 'erxes-api-shared/core-modules';
import {
  graphqlPubsub,
  markResolvers,
  redis,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import strip from 'strip';
import { IContext, IModels, generateModels } from '~/connectionResolvers';
import {
  IIntegrationDocument,
  IMessengerDataMessagesItem,
} from '~/modules/inbox/@types/integrations';
import {
  AUTO_BOT_MESSAGES,
  CONVERSATION_OPERATOR_STATUS,
  CONVERSATION_STATUSES,
  MESSAGE_TYPES,
} from '~/modules/inbox/db/definitions/constants';
import { trackViewPageEvent } from '~/modules/inbox/events';
import { debugError, fillSearchTextItem } from '~/modules/inbox/utils';
import { withLiveTicketOptions } from '~/modules/ticket/utils/ticketConfig';
import { nanoid } from 'nanoid';
import {
  assertOwnsConversation,
  assertOwnsTicket,
  findVisitorCustomer,
  readWidgetSession,
  requireWidgetSession,
  resolveSessionCustomerId,
  signWidgetSession,
} from '~/modules/inbox/widgetSession';

export const pConversationClientMessageInserted = async (
  subdomain,
  message: { _id: string; [other: string]: any },
) => {
  const models = await generateModels(subdomain);

  const conversation = await models.Conversations.findOne(
    {
      _id: message.conversationId,
    },
    { integrationId: 1 },
  );

  let integration;

  if (conversation) {
    integration = await models.Integrations.findOne(
      {
        _id: conversation.integrationId,
      },
      { _id: 1, name: 1, channelId: 1 },
    );
  }

  let channelMemberIds: string[] = [];

  if (integration) {
    const channelMembers = await models.ChannelMembers.find(
      { channelId: integration.channelId },
      { memberId: 1 },
    ).lean();

    channelMemberIds = [
      ...channelMemberIds,
      ...channelMembers.map((member: { memberId: string }) => member?.memberId),
    ];
  }

  try {
    await graphqlPubsub.publish(
      `conversationMessageInserted:${conversation?._id}`,
      {
        conversationMessageInserted: message,
        subdomain,
        conversation,
        integration,
      },
    );
  } catch (err) {
    console.log('Error publishing subscription:', err);
    throw new Error(
      'conversationMessageInserted Error publishing subscription:',
    );
  }
  for (const userId of channelMemberIds) {
    await graphqlPubsub.publish(
      `conversationClientMessageInserted:${subdomain}:${userId}`,
      {
        conversationClientMessageInserted: message,
        subdomain,
        conversation,
        integration,
      },
    );
  }
};

export const getMessengerData = async (
  models: IModels,
  subdomain: string,
  integration: IIntegrationDocument,
) => {
  let messagesByLanguage: IMessengerDataMessagesItem | null = null;
  let messengerData = integration.messengerData;
  const isOnline = models.Integrations.isOnline(integration) ?? false;

  if (messengerData) {
    if (messengerData.toJSON) {
      messengerData = messengerData.toJSON() as any;
    }

    const languageCode = integration.languageCode || 'en';
    const messages = messengerData?.messages;

    if (messages) {
      messagesByLanguage = messages[languageCode];

      if (!messagesByLanguage) {
        const languageKeys = Object.keys(messages);
        const partialMatch = languageKeys.find(
          (key) =>
            key.startsWith(languageCode) ||
            languageCode.startsWith(key.split('-')[0]),
        );

        if (partialMatch) {
          messagesByLanguage = messages[partialMatch];
        } else if (languageKeys.length > 0) {
          messagesByLanguage = messages[languageKeys[0]];
        }
      }
    }

    if (
      messengerData &&
      messengerData.hideWhenOffline &&
      messengerData.availabilityMethod === 'auto' &&
      !isOnline
    ) {
      messengerData.showChat = false;
    }
  }

  // knowledgebase app =======
  const kbApp: any = await models.MessengerApps.findOne({
    kind: 'knowledgebase',
    'credentials.integrationId': integration._id,
  });
  const topicId = kbApp && kbApp.credentials ? kbApp.credentials.topicId : null;

  // lead app ==========
  const leadApps: any[] = await models.MessengerApps.find({
    kind: 'lead',
    'credentials.integrationId': integration._id,
  });
  const formCodes = [] as string[];

  for (const app of leadApps) {
    if (app.credentials) {
      formCodes.push(app.credentials.formCode);
    }
  }

  // website app ============
  const websiteApps = await models.MessengerApps.find({
    kind: 'website',
    'credentials.integrationId': integration._id,
  });
  const { automationId } = (messengerData || {}) as any;
  let getStartedCondition: { isSelected?: boolean } | false = false;
  let aiAgentLabel = 'erxes';

  if (automationId) {
    const automations = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'automation',
      action: 'find',
      input: {
        query: {
          triggerType: 'frontline:inbox.messages',
        },
      },
    }).catch(() => []);

    const automation = (automations || []).find(
      (a: any) => String(a._id) === String(automationId),
    );

    getStartedCondition =
      (automation?.triggers || [])
        .flatMap((t: any) => t.config?.conditions || [])
        .find((c: any) => c.type === 'getStarted') || false;

    aiAgentLabel =
      (automation?.actions || []).find((a: any) => a.type === 'aiAgent')
        ?.label ?? 'erxes';
  }

  return {
    ...messengerData,
    isOnline,
    getStarted: getStartedCondition ? getStartedCondition.isSelected : false,
    messages: messagesByLanguage,
    knowledgeBaseTopicId: topicId ?? messengerData?.knowledgeBaseTopicId,
    websiteApps,
    formCodes,
    aiAgentLabel,
  };
};

const getOrCreateVisitorCustomer = async (
  subdomain: string,
  visitorId: string,
) =>
  (await findVisitorCustomer(subdomain, visitorId)) ||
  (await createVisitor(subdomain, visitorId));

const createVisitor = async (subdomain: string, visitorId: string) => {
  const customer = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'customers',
    action: 'createCustomer',
    input: {
      doc: { state: 'visitor', visitorId },
    },
  });

  return customer;
};

/**
 * A typed contact becomes the primary one only while no other customer holds
 * it: core refuses a duplicate primary, and an unverified claim must never
 * fail the save or touch someone else's record. It stays in the list anyway.
 */
const freePrimaryContacts = async (
  subdomain: string,
  customerId: string,
  { email, phone }: { email?: string; phone?: string },
) => {
  const isFree = async (
    field: 'primaryEmail' | 'primaryPhone',
    value: string,
  ) => {
    const holders: Array<{ _id: string }> =
      (await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'customers',
        action: 'find',
        input: {
          query: {
            [field]: value,
            _id: { $ne: customerId },
            status: { $ne: 'deleted' },
          },
        },
        defaultValue: [],
      })) || [];

    return !holders.length;
  };

  return {
    ...(email &&
      (await isFree('primaryEmail', email)) && {
        primaryEmail: email,
      }),
    ...(phone &&
      (await isFree('primaryPhone', phone)) && {
        primaryPhone: phone,
      }),
  };
};

const findMessengerCompany = async (
  subdomain: string,
  companyData: { name?: string; email?: string; phone?: string },
) => {
  const selectors: Array<Record<string, string>> = [];

  if (companyData.name) {
    selectors.push({ name: companyData.name });
  }

  if (companyData.email) {
    selectors.push({ email: companyData.email });
  }

  if (companyData.phone) {
    selectors.push({ phone: companyData.phone });
  }

  for (const query of selectors) {
    const company = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'companies',
      action: 'findOne',
      input: { query },
    });

    if (company?._id) {
      return company;
    }
  }

  return null;
};

export interface ITicketWidget {
  name: string;
  description: string;
  attachments: IAttachment[];
  statusId: string;
  pipelineId: string;
  channelId: string;
  type: string;
  tagIds: string[];
  propertiesData?: IPropertyField;
}

/*
 * Keeps only the property fields the ticket form of that pipeline exposes,
 * enforces the required ones and validates the values against their definition
 */
const buildTicketPropertiesData = async (
  models: IModels,
  subdomain: string,
  pipelineId: string,
  propertiesData?: IPropertyField,
): Promise<IPropertyField | undefined> => {
  const config = await models.TicketConfig.findOne({ pipelineId }).lean();
  const propertyFields = config?.propertyFields || [];

  if (!propertyFields.length) {
    return undefined;
  }

  const filteredData: IPropertyField = {};

  for (const propertyField of propertyFields) {
    const value = propertiesData?.[propertyField.fieldId];
    const isEmpty = value === undefined || value === null || value === '';

    if (isEmpty) {
      if (propertyField.isRequired) {
        throw new Error(
          `${propertyField.label || 'Property field'} is required`,
        );
      }
      continue;
    }

    filteredData[propertyField.fieldId] = value;
  }

  if (!Object.keys(filteredData).length) {
    return undefined;
  }

  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'fields',
    action: 'validateFieldValues',
    input: { data: filteredData },
    defaultValue: filteredData,
  });
};

export const widgetMutations: Record<string, Resolver> = {
  async widgetsLeadIncreaseViewCount(
    _root,
    { formId }: { formId: string },
    { models }: IContext,
  ) {
    return models.Integrations.increaseViewCount(formId);
  },

  async widgetsMessengerConnect(
    _root,
    args: {
      integrationId: string;
      email?: string;
      phone?: string;
      code?: string;
      isUser?: boolean;
      companyData?: any;
      data?: any;
      deviceToken?: string;
    },
    { models, subdomain, req }: IContext,
  ) {
    const {
      integrationId,
      email,
      phone,
      code,
      isUser,
      companyData,
      data,
      deviceToken,
    } = args;

    const session = readWidgetSession(req);
    const ownSession =
      session?.integrationId === integrationId ? session : null;

    // A visitor who has written becomes a customer; the session follows.
    const sessionCustomerId =
      ownSession?.customerId ||
      (ownSession?.visitorId
        ? (await findVisitorCustomer(subdomain, ownSession.visitorId))?._id
        : undefined);

    const customData = data;

    // find integration
    const integration = await models.Integrations.findOne({
      _id: integrationId,
      kind: 'messenger',
    });
    if (!integration) {
      throw new Error('Integration not found');
    }

    const channel = await models.Channels.findOne({
      _id: integration.channelId,
    });
    if (!channel) {
      throw new Error('Channel not found');
    }

    let customer;

    // Identity comes only from our own token: a claimed email or phone never
    // finds an existing customer, it is stored on the visitor's own record.
    if (sessionCustomerId || email || phone || code) {
      customer = sessionCustomerId
        ? await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'customers',
            action: 'getWidgetCustomer',
            input: {
              integrationId: integration._id,
              cachedCustomerId: sessionCustomerId,
            },
          })
        : null;

      const doc = {
        integrationId: integration._id,
        email,
        phone,
        code,
        isUser,
        deviceToken,
      };

      if (customer) {
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'customers',
          action: 'updateMessengerCustomer',
          input: {
            _id: customer._id,
            doc,
            customData,
          },
        });
      } else {
        customer = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'customers',
          action: 'createMessengerCustomer',
          input: {
            doc,
            customData,
          },
        });
      }
    }

    // get or create company
    if (companyData?.name) {
      let company = await findMessengerCompany(subdomain, companyData);

      const fieldData = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'fields',
        action: 'generatePropertiesData',
        input: {
          query: {
            customData: companyData,
            contentType: 'core:company',
          },
        },
      });

      companyData.propertiesData = fieldData?.propertiesData || {};
      companyData.trackedData = fieldData?.trackedData || [];

      if (company) {
        company = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'companies',
          action: 'updateCompany',
          input: {
            _id: company._id,
            doc: companyData,
          },
        });

        await sendTRPCMessage({
          subdomain,
          pluginName: 'automations',
          method: 'mutation',
          module: 'automations',
          action: 'trigger',
          input: {
            type: 'core:company',
            targets: [company],
          },
        });
      } else {
        companyData.primaryName = companyData.name;
        companyData.names = [companyData.name];

        company = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'companies',
          action: 'createCompany',
          input: {
            doc: { ...companyData },
          },
        });
      }
    }

    // Fingerprints collide and are not secret, so visitors get a server-made id.
    const sessionVisitorId = customer
      ? undefined
      : ownSession?.visitorId || nanoid();

    if (!integration.isConnected) {
      await models.Integrations.updateOne(
        { _id: integration._id },
        { $set: { isConnected: true } },
      );
    }
    const configs = integration.ticketConfigIds?.length
      ? await models.TicketConfig.find({
          _id: { $in: integration.ticketConfigIds },
        }).lean()
      : [];

    const ticketConfigs = await Promise.all(
      configs.map(async (config) => ({
        ...config,
        propertyFields: await withLiveTicketOptions(
          subdomain,
          config.propertyFields,
        ),
      })),
    );

    return {
      integrationId: integration._id,
      uiOptions: integration.uiOptions,
      languageCode: integration.languageCode,
      ticketConfigs,
      messengerData: await getMessengerData(models, subdomain, integration),
      customerId: customer?._id,
      visitorId: sessionVisitorId,
      sessionToken: signWidgetSession({
        integrationId: integration._id,
        customerId: customer?._id,
        visitorId: sessionVisitorId,
      }),
      channel: {
        _id: channel._id,
      },
    };
  },
  /*
   * Create a new message
   */
  async widgetsInsertMessage(
    _root,
    args: {
      integrationId: string;
      conversationId?: string;
      message: string;
      skillId?: string;
      attachments?: any[];
      contentType: string;
      payload: string;
    },
    { models, subdomain, req }: IContext,
  ) {
    const {
      integrationId,
      conversationId,
      message,
      skillId,
      attachments,
      contentType,
      payload,
    } = args;

    if (contentType === MESSAGE_TYPES.VIDEO_CALL_REQUEST) {
      const videoCallRequestMessage = await models.ConversationMessages.findOne(
        { conversationId, contentType },
        { createdAt: 1 },
      ).sort({ createdAt: -1 });

      if (videoCallRequestMessage) {
        const messageTime = new Date(
          videoCallRequestMessage.createdAt,
        ).getTime();

        const nowTime = Date.now();

        let integrationConfigs: Array<{ code: string; value?: string }> = [];

        try {
          integrationConfigs = await models.Configs.find({});
        } catch (e) {
          debugError(e);
        }

        const timeDelay = integrationConfigs.find(
          (config) => config.code === 'VIDEO_CALL_TIME_DELAY_BETWEEN_REQUESTS',
        ) || { value: '0' };

        const timeDelayIntValue = Number.parseInt(timeDelay.value || '0', 10);

        const timeDelayValue = Number.isNaN(timeDelayIntValue)
          ? 0
          : timeDelayIntValue;

        if (messageTime + timeDelayValue * 1000 > nowTime) {
          const defaultValue = 'Video call request has already been sent';

          const messageForDelay = integrationConfigs.find(
            (config) => config.code === 'VIDEO_CALL_MESSAGE_FOR_TIME_DELAY',
          ) || { value: defaultValue };

          throw new Error(messageForDelay.value || defaultValue);
        }
      }
    }

    const session = requireWidgetSession(req, integrationId);

    if (conversationId) {
      assertOwnsConversation(
        session,
        await models.Conversations.findOne({ _id: conversationId }),
      );
    }

    const conversationContent = strip(message || '').substring(0, 100);

    const { visitorId } = session;
    const customerId =
      session.customerId ||
      (visitorId
        ? (await getOrCreateVisitorCustomer(subdomain, visitorId))._id
        : undefined);

    let conversation;

    const integration =
      (await models.Integrations.findOne({ _id: integrationId })) ||
      ({} as any);
    const messengerData = integration.messengerData || {};
    const { botEndpointUrl, botShowInitialMessage, botCheck, automationId } =
      messengerData;
    let botId;
    if (botCheck === true) {
      botId = integration?._id;
    }
    const HAS_BOTENDPOINT_URL = (botEndpointUrl || '').length > 0;

    if (conversationId) {
      conversation = await models.Conversations.findOne({
        _id: conversationId,
      }).lean();
      conversation = await models.Conversations.findByIdAndUpdate(
        conversationId,
        {
          readUserIds: [],

          status: CONVERSATION_STATUSES.OPEN,
        },
        { new: true },
      );
    } else {
      conversation = await models.Conversations.createConversation({
        botId,
        isBot: !!botId,
        customerId,
        integrationId,
        visitorId,
        operatorStatus:
          HAS_BOTENDPOINT_URL || !!botId
            ? CONVERSATION_OPERATOR_STATUS.BOT
            : CONVERSATION_OPERATOR_STATUS.OPERATOR,
        status: CONVERSATION_STATUSES.OPEN,
        content: conversationContent,
        ...(skillId ? { skillId } : {}),
      });
    }

    let parsedPayload: Record<string, string> | undefined;
    let ticketFormWidgetData:
      | {
          _id: string;
          type: string;
          text: string;
          value: string;
          column: number;
        }[]
      | undefined;
    if (contentType === MESSAGE_TYPES.TICKET_FORM_SUBMISSION && payload) {
      try {
        parsedPayload = JSON.parse(payload);
      } catch (_e) {
        // ignore malformed payload
      }
      if (parsedPayload) {
        const TICKET_FIELD_LABELS: Record<string, string> = {
          'ticket:name': 'Ticket name',
          'ticket:description': 'Description',
        };
        ticketFormWidgetData = Object.entries(parsedPayload).map(
          ([key, value]) => ({
            _id: key,
            type: key === 'ticket:description' ? 'textarea' : 'input',
            text: TICKET_FIELD_LABELS[key] || key,
            value: String(value),
            column: 6,
          }),
        );
      }
    }

    const msg = await models.ConversationMessages.createMessage({
      conversationId: conversation._id,
      customerId,
      attachments,
      contentType,
      content: message,
      botId: botId,
      ...(ticketFormWidgetData ? { formWidgetData: ticketFormWidgetData } : {}),
    });

    await models.Conversations.updateOne(
      { _id: msg.conversationId },
      {
        $set: {
          status: CONVERSATION_STATUSES.OPEN,

          content: conversationContent,

          readUserIds: [],

          customerId,

          // visitorId: '',
        },
      },
    );

    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'customers',
      action: 'markCustomerAsActive',
      input: {
        customerId: conversation.customerId,
      },
    });

    await pConversationClientMessageInserted(subdomain, msg);
    graphqlPubsub.publish(`conversationMessageInserted:${msg.conversationId}`, {
      conversationMessageInserted: msg,
    });

    if (
      botId &&
      !HAS_BOTENDPOINT_URL &&
      conversation.operatorStatus !== CONVERSATION_OPERATOR_STATUS.OPERATOR
    ) {
      graphqlPubsub.publish(
        `conversationBotTypingStatus:${msg.conversationId}`,
        {
          conversationBotTypingStatus: {
            conversationId: msg.conversationId,
            typing: true,
          },
        },
      );

      sendAutomationTrigger(
        subdomain,
        {
          type: 'frontline:inbox.messages',
          targets: [
            {
              ...msg.toObject(),
              ...(parsedPayload || {}),
              integrationId,
              automationId: automationId || undefined,
            },
          ],
        },
        {
          jobOptions: {
            priority: 1,
            removeOnComplete: true,
            removeOnFail: true,
          },
        },
      );
    }

    if (
      HAS_BOTENDPOINT_URL &&
      !botShowInitialMessage &&
      conversation.operatorStatus === CONVERSATION_OPERATOR_STATUS.BOT
    ) {
      graphqlPubsub.publish(
        `conversationBotTypingStatus:${msg.conversationId}`,
        {
          conversationBotTypingStatus: {
            conversationId: msg.conversationId,
            typing: true,
          },
        },
      );

      try {
        const botRequest = await fetch(
          `${botEndpointUrl}/${conversation._id}`,
          {
            method: 'POST',
            body: JSON.stringify({
              type: 'text',
              text: message,
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        ).then((r) => r.json());

        const { responses } = botRequest;

        const botData =
          responses.length > 0
            ? responses
            : [
                {
                  type: 'text',
                  text: AUTO_BOT_MESSAGES.NO_RESPONSE,
                },
              ];

        const botMessage = await models.ConversationMessages.createMessage({
          conversationId: conversation._id,
          customerId,
          contentType,
          botData,
          fromBot: true,
        });
        graphqlPubsub.publish(
          `conversationBotTypingStatus:${msg.conversationId}`,
          {
            conversationBotTypingStatus: {
              conversationId: msg.conversationId,
              typing: false,
            },
          },
        );

        graphqlPubsub.publish(
          `conversationMessageInserted:${botMessage.conversationId}`,
          {
            conversationMessageInserted: botMessage,
          },
        );
      } catch (e) {
        debugError(`Failed to connect to BOTPRESS: ${e.message}`);
      }
    }

    const customerLastStatus =
      (await redis.get(`customer_last_status_${customerId}`)) || 'left';

    if (customerLastStatus === 'left' && customerId) {
      await redis.set(`customer_last_status_${customerId}`, 'joined');

      const conversationMessages =
        await models.Conversations.changeCustomerStatus(
          'joined',
          customerId,
          conversation.integrationId,
        );

      for (const mg of conversationMessages) {
        graphqlPubsub.publish(
          `conversationMessageInserted:${mg.conversationId}`,
          {
            conversationMessageInserted: mg,
          },
        );
      }

      graphqlPubsub.publish(`customerConnectionChanged:${customerId}`, {
        customerConnectionChanged: {
          _id: customerId,
          status: 'connected',
        },
      });
    }

    return msg;
  },

  /*
   * Mark given conversation's messages as read
   */
  async widgetsReadConversationMessages(
    _root,
    args: { conversationId: string },
    { models, subdomain, req }: IContext,
  ) {
    assertOwnsConversation(
      requireWidgetSession(req),
      await models.Conversations.findOne({ _id: args.conversationId }),
    );

    const unreadMessages = await models.ConversationMessages.find({
      conversationId: args.conversationId,
      userId: { $exists: true },
      isCustomerRead: { $ne: true },
    }).lean();

    await models.ConversationMessages.updateMany(
      {
        conversationId: args.conversationId,
        userId: { $exists: true },
        isCustomerRead: { $ne: true },
      },
      { isCustomerRead: true },
      { multi: true },
    );

    await Promise.all(
      unreadMessages.map((message) =>
        graphqlPubsub.publish(
          `conversationMessageUpdated:${subdomain}:${args.conversationId}`,
          {
            conversationMessageUpdated: {
              ...message,
              isCustomerRead: true,
            },
          },
        ),
      ),
    );

    return args.conversationId;
  },

  /*
   * Update customer location field
   */
  async widgetsSaveBrowserInfo(
    _root,
    { browserInfo }: { browserInfo: IBrowserInfo },
    { models, subdomain, req }: IContext,
  ) {
    const { visitorId, customerId } = requireWidgetSession(req);

    if (customerId) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'updateLocation',
        input: {
          customerId,
          browserInfo,
        },
      });

      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'updateSession',
        input: {
          customerId,
        },
      });
    }

    try {
      await trackViewPageEvent(models, subdomain, {
        visitorId,
        customerId,
        attributes: { url: browserInfo.url },
      });
    } catch (e) {
      /* istanbul ignore next */
      debugError(
        `Error occurred during widgets save browser info ${e.message}`,
      );
    }

    return null;
  },

  async widgetsSendTypingInfo(
    _root,
    args: { conversationId: string; text?: string },
    { models, req }: IContext,
  ) {
    assertOwnsConversation(
      requireWidgetSession(req),
      await models.Conversations.findOne({ _id: args.conversationId }),
    );

    graphqlPubsub.publish(
      `conversationClientTypingStatusChanged:${args.conversationId}`,
      {
        conversationClientTypingStatusChanged: args,
      },
    );

    return 'ok';
  },

  async widgetBotRequest(
    _root,
    {
      integrationId,
      conversationId,
      message,
    }: {
      conversationId?: string;
      integrationId: string;
      message: string;
    },
    { models, req }: IContext,
  ) {
    const session = requireWidgetSession(req, integrationId);
    const { customerId } = session;

    if (conversationId) {
      assertOwnsConversation(
        session,
        await models.Conversations.findOne({ _id: conversationId }),
      );
    }

    const integration =
      (await models.Integrations.findOne({ _id: integrationId })) ||
      ({} as any);
    if (!integration) {
      throw new Error('Integration not found');
    }

    let msg;
    if (conversationId) {
      msg = await models.ConversationMessages.createMessage({
        conversationId,
        customerId,
        content: message,
        botId: integrationId,
      });
    } else {
      const conversation = await models.Conversations.createConversation({
        botId: integrationId,
        customerId,
        integrationId,
        status: CONVERSATION_STATUSES.OPEN,
        content: message,
      });
      msg = await models.ConversationMessages.createMessage({
        conversationId: conversation._id,
        customerId,
        content: message,
        botId: integrationId,
      });
    }
    graphqlPubsub.publish(`conversationMessageInserted:${msg.conversationId}`, {
      conversationMessageInserted: msg,
    });

    return msg;
  },

  async widgetChangeOperatorStatus(
    _root,
    {
      conversationId,
      operatorStatus,
    }: { conversationId: string; operatorStatus: string },
    { models, req }: IContext,
  ) {
    assertOwnsConversation(
      requireWidgetSession(req),
      await models.Conversations.findOne({ _id: conversationId }),
    );

    if (operatorStatus === CONVERSATION_OPERATOR_STATUS.OPERATOR) {
      const message = await models.ConversationMessages.createMessage({
        conversationId,
        botData: [{ type: 'text', text: AUTO_BOT_MESSAGES.CHANGE_OPERATOR }],
        fromBot: true,
      });

      graphqlPubsub.publish(
        `conversationMessageInserted:${message.conversationId}`,
        { conversationMessageInserted: message },
      );
    }

    return models.Conversations.updateOne(
      { _id: conversationId },
      { $set: { operatorStatus } },
    );
  },

  async widgetGetBotInitialMessage(
    _root,
    { integrationId }: { integrationId: string },
    { models }: IContext,
  ) {
    const sessionId = `_${crypto.randomBytes(8).toString('hex')}`;

    await redis.set(
      `bot_initial_message_session_id_${integrationId}`,
      sessionId,
    );

    const integration =
      (await models.Integrations.findOne({ _id: integrationId })) ||
      ({} as any);
    const { botEndpointUrl } = integration.messengerData;

    const botRequest = await fetch(`${botEndpointUrl}/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'text',
        text: 'getStarted',
      }),
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => r.json());

    await redis.set(
      `bot_initial_message_${integrationId}`,
      JSON.stringify(botRequest.responses),
    );

    return { botData: botRequest.responses };
  },
  async widgetTicketCreated(
    _root,
    doc: ITicketWidget,
    { models, subdomain, user, req }: IContext,
  ) {
    const session = requireWidgetSession(req);
    const { statusId, propertiesData, name, description, attachments, tagIds } =
      doc;

    // Only the start statuses of this messenger's own ticket configs.
    const integration = await models.Integrations.findOne({
      _id: session.integrationId,
    }).lean();
    const allowedConfig = await models.TicketConfig.findOne({
      _id: { $in: integration?.ticketConfigIds || [] },
      selectedStatusId: statusId,
    }).lean();

    if (!allowedConfig) {
      throw new Error('Status not found');
    }

    const status = await models.Status.findOne({ _id: statusId });
    if (!status) {
      throw new Error('Status not found');
    }
    const pipeline = await models.Pipeline.findOne({ _id: status.pipelineId });
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    const customerId =
      session.customerId ||
      (session.visitorId
        ? (await getOrCreateVisitorCustomer(subdomain, session.visitorId))._id
        : undefined);

    if (!customerId) {
      throw new Error('Widget session required');
    }

    const validatedPropertiesData = await buildTicketPropertiesData(
      models,
      subdomain,
      status.pipelineId,
      propertiesData,
    );

    try {
      const ticket = await models.Ticket.create({
        name,
        description,
        attachments,
        tagIds,
        propertiesData: validatedPropertiesData,
        statusId: statusId,
        pipelineId: status.pipelineId,
        channelId: pipeline.channelId,
        customerId,
        createdAt: new Date(),
        modifiedAt: new Date(),
        stageChangedDate: new Date(),
        searchText: fillSearchTextItem(doc),
        number: Date.now().toString(),
        createdBy: user?._id,
      });
      return ticket;
    } catch (e) {
      throw new Error(e.message);
    }
  },
  async widgetsTicketCustomersEdit(
    _root,
    args: {
      firstName?: string;
      lastName?: string;
      emails?: string[];
      phones?: string[];
    },
    { models, subdomain, req }: IContext,
  ) {
    const session = requireWidgetSession(req);
    const { firstName, lastName, emails, phones } = args;

    // A claimed contact lands on the visitor's own record, never someone else's.
    const customerId =
      session.customerId ||
      (session.visitorId
        ? (await getOrCreateVisitorCustomer(subdomain, session.visitorId))._id
        : undefined);

    if (!customerId) {
      throw new Error('Widget session required');
    }

    // Core does not derive primaries from the lists; staff forms read them.
    const primaries = await freePrimaryContacts(subdomain, customerId, {
      email: emails?.[0],
      phone: phones?.[0],
    });

    const customer = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'customers',
      action: 'updateCustomer',
      input: {
        _id: customerId,
        doc: {
          _id: customerId,
          firstName,
          lastName,
          emails,
          phones,
          ...primaries,
        },
      },
    });

    if (!customer) {
      throw new Error('Could not save your contact info. Please try again.');
    }
    // The customer's latest ticket: tickets keep their customer themselves.
    const ticket = await models.Ticket.findOne({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .lean();

    if (!ticket) throw new Error('No ticket relation found');

    return ticket.number || '';
  },

  async widgetTicketCommentAdd(
    _root,
    args: {
      contentId: string;
      content: string;
    },
    { models, subdomain, req }: IContext,
  ) {
    const session = requireWidgetSession(req);
    const { content, contentId } = args;

    await assertOwnsTicket(subdomain, session, contentId, models);

    const customerId = await resolveSessionCustomerId(subdomain, session);

    // Visitors own no tickets, so the check above already refused them.
    if (!customerId) {
      throw new Error('Ticket not found');
    }

    return await models.Note.createNote({
      doc: {
        content,
        contentId,
        createdBy: customerId,
      },
      subdomain,
      userId: customerId,
    });
  },
  async widgetTicketCommentRemove(
    _root,
    args: {
      _id: string;
    },
    { models, subdomain, req }: IContext,
  ) {
    const session = requireWidgetSession(req);
    const note = await models.Note.findOne({ _id: args._id }).lean();
    const customerId = await resolveSessionCustomerId(subdomain, session);

    // Only the customer's own comment on their own ticket.
    if (!note || !customerId || note.createdBy !== customerId) {
      throw new Error('Comment not found');
    }

    await assertOwnsTicket(subdomain, session, note.contentId, models);
    await models.Note.deleteOne({ _id: note._id });

    return 'success';
  },
};

markResolvers(widgetMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});
