import {
  getEnv,
  graphqlPubsub,
  isEnabled,
  redis,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels, generateModels } from '~/connectionResolvers';
import {
  IIntegrationDocument,
  IMessengerDataMessagesItem,
} from '~/modules/inbox/@types/integrations';
import { IContext } from '~/connectionResolvers';
import {
  AUTO_BOT_MESSAGES,
  CONVERSATION_OPERATOR_STATUS,
  CONVERSATION_STATUSES,
  MESSAGE_TYPES,
} from '~/modules/inbox/db/definitions/constants';
import { debugError } from '~/modules/inbox/utils';
import strip from 'strip';
import { IBrowserInfo } from 'erxes-api-shared/core-types';
import { VERIFY_EMAIL_TRANSLATIONS } from '~/modules/inbox/constants';
import { trackViewPageEvent } from '~/modules/inbox/events';

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
    const channels = await models.Channels.find(
      {
        integrationIds: { $in: [integration._id] },
      },
      { _id: 1 },
    );

    for (const channel of channels) {
      const members = await models.ChannelMembers.find(
        { channelId: channel._id },
        { memberId: 1 },
      );
      const memberIds = members.map((member) => member.memberId);
      channelMemberIds = [...channelMemberIds, ...memberIds];
    }
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

  if (messengerData) {
    if (messengerData.toJSON) {
      messengerData = messengerData.toJSON() as any;
    }

    const languageCode = integration.languageCode || 'en';
    const messages = (messengerData || {}).messages;

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
      messengerData.availabilityMethod === 'auto'
    ) {
      const isOnline = await models.Integrations.isOnline(integration);
      if (!isOnline) {
        messengerData.showChat = false;
      }
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
    if (app && app.credentials) {
      formCodes.push(app.credentials.formCode);
    }
  }

  // website app ============
  const websiteApps = await models.MessengerApps.find({
    kind: 'website',
    'credentials.integrationId': integration._id,
  });
  let getStartedCondition: { isSelected?: boolean } | false = false;
  const isServiceAvailable = await isEnabled('automations');

  if (isServiceAvailable) {
    const getStarted = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'automations',
      action: 'trigger.find',
      input: {
        query: {
          triggerType: 'inbox:messages',
          botId: integration._id,
        },
      },
    }).catch((error) => {
      throw error;
    });

    getStartedCondition = (
      getStarted[0]?.triggers[0]?.config?.conditions || []
    ).find((condition) => condition.type === 'getStarted');
  }

  return {
    ...(messengerData || {}),
    getStarted: getStartedCondition ? getStartedCondition.isSelected : false,
    messages: messagesByLanguage,
    knowledgeBaseTopicId: topicId,
    websiteApps,
    formCodes,
  };
};

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

export const widgetMutations = {
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
      cachedCustomerId?: string;
      deviceToken?: string;
      visitorId?: string;
    },
    { models, subdomain }: IContext,
  ) {
    const {
      integrationId,
      email,
      phone,
      code,
      isUser,
      companyData,
      data,

      cachedCustomerId,
      deviceToken,
      visitorId,
    } = args;

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

    if (cachedCustomerId || email || phone || code) {
      customer = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'customers',
        action: 'getWidgetCustomer',
        input: {
          integrationId: integration._id,
          cachedCustomerId,
          email,
          phone,
          code,
        },
        defaultValue: [],
      });

      const doc = {
        integrationId: integration._id,
        email,
        phone,
        code,
        isUser,
        deviceToken,
      };
      customer = customer
        ? await sendTRPCMessage({
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
          })
        : await sendTRPCMessage({
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

    // get or create company
    if (companyData && companyData.name) {
      let company = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'companies',
        action: 'findOne',
        input: {
          query: {
            companyData,
          },
        },
      });

      const { customFieldsData, trackedData } = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'fields',
        action: 'generateCustomFieldsData',
        input: {
          query: {
            customData: companyData,
            contentType: 'core:company',
          },
        },
      });

      companyData.customFieldsData = customFieldsData;
      companyData.trackedData = trackedData;

      if (!company) {
        companyData.primaryName = companyData.name;
        companyData.names = [companyData.name];

        company = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'companies',
          action: 'createCompany',
          input: {
            query: {
              ...companyData,
            },
          },
        });
      } else {
        company = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'companies',
          action: 'updateCompany',
          input: {
            query: {
              _id: company._id,
              doc: companyData,
            },
          },
        });

        await sendTRPCMessage({
          subdomain,
          pluginName: 'automations',
          method: 'mutation',
          module: 'triggers',
          action: 'trigger',
          input: {
            type: 'core:company',
            targets: [company],
          },
        });
      }

      if (customer && company) {
        // add company to customer's companyIds list

        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'conformities',
          action: 'create',
          input: {
            mainType: 'customer',
            mainTypeId: customer._id,
            relType: 'company',
            relTypeId: company._id,
          },
        });
      }
    }

    if (!integration.isConnected) {
      await models.Integrations.updateOne(
        { _id: integration._id },
        { $set: { isConnected: true } },
      );
    }

    return {
      integrationId: integration._id,
      uiOptions: integration.uiOptions,
      languageCode: integration.languageCode,
      ticketData: integration.ticketData,
      messengerData: await getMessengerData(models, subdomain, integration),
      customerId: customer && customer._id,
      visitorId: customer ? null : visitorId,
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
      customerId?: string;
      visitorId?: string;
      conversationId?: string;
      message: string;
      skillId?: string;
      attachments?: any[];
      contentType: string;
      payload: string;
    },
    { models, subdomain }: IContext,
  ) {
    const {
      integrationId,
      visitorId,
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

        const nowTime = new Date().getTime();

        let integrationConfigs: Array<{ code: string; value?: string }> = [];

        try {
          integrationConfigs = await models.Configs.find({});
        } catch (e) {
          debugError(e);
        }

        const timeDelay = integrationConfigs.find(
          (config) => config.code === 'VIDEO_CALL_TIME_DELAY_BETWEEN_REQUESTS',
        ) || { value: '0' };

        const timeDelayIntValue = parseInt(timeDelay.value || '0', 10);

        const timeDelayValue = isNaN(timeDelayIntValue) ? 0 : timeDelayIntValue;

        if (messageTime + timeDelayValue * 1000 > nowTime) {
          const defaultValue = 'Video call request has already been sent';

          const messageForDelay = integrationConfigs.find(
            (config) => config.code === 'VIDEO_CALL_MESSAGE_FOR_TIME_DELAY',
          ) || { value: defaultValue };

          throw new Error(messageForDelay.value || defaultValue);
        }
      }
    }

    const conversationContent = strip(message || '').substring(0, 100);

    let { customerId } = args;

    if (visitorId && !customerId) {
      const customer = await createVisitor(subdomain, visitorId);
      customerId = customer._id;
    }

    let conversation;

    const integration =
      (await models.Integrations.findOne({ _id: integrationId })) ||
      ({} as any);
    const messengerData = integration.messengerData || {};
    const { botEndpointUrl, botShowInitialMessage, botCheck } = messengerData;
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
        operatorStatus: HAS_BOTENDPOINT_URL
          ? CONVERSATION_OPERATOR_STATUS.BOT
          : CONVERSATION_OPERATOR_STATUS.OPERATOR,
        status: CONVERSATION_STATUSES.OPEN,
        content: conversationContent,
        ...(skillId ? { skillId } : {}),
      });
    }

    const msg = await models.ConversationMessages.createMessage({
      conversationId: conversation._id,
      customerId,
      attachments,
      contentType,
      content: message,
      botId: botId,
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
          responses.length !== 0
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
    { models }: IContext,
  ) {
    await models.ConversationMessages.updateMany(
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

  async widgetsSaveCustomerGetNotified(
    _root,
    args,
    { models, subdomain }: IContext,
  ) {
    const { visitorId, customerId } = args;

    if (visitorId && !customerId) {
      const customer = await createVisitor(subdomain, visitorId);
      args.customerId = customer._id;

      await models.ConversationMessages.updateVisitorEngageMessages(
        visitorId,
        customer._id,
      );
      await models.Conversations.updateMany(
        {
          visitorId,
        },
        { $set: { customerId: customer._id, visitorId: '' } },
      );
    }

    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'customers',
      action: 'saveVisitorContactInfo',
      input: {
        args,
      },
    });
  },

  /*
   * Update customer location field
   */
  async widgetsSaveBrowserInfo(
    _root,
    {
      visitorId,
      customerId,
      browserInfo,
    }: { visitorId?: string; customerId?: string; browserInfo: IBrowserInfo },
    { subdomain }: IContext,
  ) {
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

    // if (visitorId) {
    //   await sendTRPCMessage({subdomain,
    //     pluginName: 'core',
    //     method: 'mutation',
    //     module: 'customers',
    //     action: 'updateEntry',
    //     input: {
    //       visitorId,
    //       location: browserInfo,
    //     },
    //   });
    // }

    try {
      await trackViewPageEvent(subdomain, {
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
  ) {
    graphqlPubsub.publish(
      `conversationClientTypingStatusChanged:${args.conversationId}`,
      {
        conversationClientTypingStatusChanged: args,
      },
    );

    return 'ok';
  },

  async widgetsSendEmail(_root, args, { subdomain }: IContext) {
    const { toEmails, fromEmail, title, content, customerId, formId } = args;

    const attachments = args.attachments || [];

    const form = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'forms',
      action: 'findOne',
      input: {
        query: {
          _id: formId,
        },
      },
    });

    let finalContent = content;

    let mailAttachment: any = [];

    if (attachments.length > 0) {
      mailAttachment = attachments.map((file) => {
        return {
          filename: file.name || '',
          path: file.url || '',
        };
      });
    }

    const { verifyEmail = false } = form.leadData || {};

    if (verifyEmail) {
      const domain = getEnv({ name: 'DOMAIN', subdomain })
        ? `${getEnv({ name: 'DOMAIN', subdomain })}/gateway`
        : 'http://localhost:4000';

      for (const email of toEmails) {
        const params = Buffer.from(
          JSON.stringify({
            email,
            formId,
            customerId,
          }),
        ).toString('base64');

        const emailValidationUrl = `${domain}/verify?p=${params}`;

        const languageCode = form.languageCode || 'en';
        const text =
          VERIFY_EMAIL_TRANSLATIONS[languageCode] ||
          VERIFY_EMAIL_TRANSLATIONS.en;

        finalContent += `\n<p><a href="${emailValidationUrl}" target="_blank">${text}</a></p>`;

        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'core',
          action: 'sendEmail',
          input: {
            toEmails: [email],
            fromEmail,
            title,
            template: { data: { content: finalContent } },
            attachments: mailAttachment,
          },
        });
      }

      return;
    }

    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'core',
      action: 'sendEmail',
      input: {
        toEmails,
        fromEmail,
        title,
        template: { data: { content: finalContent } },
        attachments: mailAttachment,
      },
    });
  },

  async widgetBotRequest(
    _root,
    {
      integrationId,
      conversationId,
      customerId,
      message,
      type,
      payload,
    }: {
      conversationId?: string;
      customerId?: string;
      visitorId?: string;
      integrationId: string;
      message: string;
      payload: string;
      type: string;
    },
    { models, subdomain }: IContext,
  ) {
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

  async widgetGetBotInitialMessage(
    _root,
    { integrationId }: { integrationId: string },
    { models }: IContext,
  ) {
    const sessionId = `_${Math.random().toString(36).substr(2, 9)}`;

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
};
