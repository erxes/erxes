import * as strip from "strip";

import {
  CONVERSATION_OPERATOR_STATUS,
  CONVERSATION_STATUSES,
  MESSAGE_TYPES
} from "../../models/definitions/constants";

import {
  IAttachment,
  IIntegrationDocument,
  IMessengerDataMessagesItem
} from "../../models/definitions/integrations";

import { debugError, debugInfo } from "@erxes/api-utils/src/debuggers";

import redis from "@erxes/api-utils/src/redis";
import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";

import {
  AUTO_BOT_MESSAGES,
  BOT_MESSAGE_TYPES
} from "../../models/definitions/constants";

import { getEnv, sendToWebhook } from "@erxes/api-utils/src";

import { IBrowserInfo } from "@erxes/api-utils/src/definitions/common";
import EditorAttributeUtil from "@erxes/api-utils/src/editorAttributeUtils";
import { getServices } from "@erxes/api-utils/src/serviceDiscovery";
import { IContext, IModels } from "../../connectionResolver";
import { VERIFY_EMAIL_TRANSLATIONS } from "../../constants";
import { trackViewPageEvent } from "../../events";
import {
  sendAutomationsMessage,
  sendCoreMessage,
  sendIntegrationsMessage
} from "../../messageBroker";
import fetch from "node-fetch";

interface IWidgetEmailParams {
  toEmails: string[];
  fromEmail: string;
  title: string;
  content: string;
  customerId?: string;
  formId?: string;
  attachments?: IAttachment[];
}

export const pConversationClientMessageInserted = async (
  models,
  subdomain,
  message: { _id: string; [other: string]: any }
) => {
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
      { _id: 1, name: 1 }
    );
  }

  let channelMemberIds: string[] = [];

  if (integration) {
    const channels = await models.Channels.find(
      {
        integrationIds: { $in: [integration._id] }
      },
      { _id: 1, memberIds: 1 }
    );

    for (const channel of channels) {
      channelMemberIds = [...channelMemberIds, ...(channel.memberIds || [])];
    }
  }

  graphqlPubsub.publish(`conversationMessageInserted:${conversation._id}`, {
    conversationMessageInserted: message,
    subdomain,
    conversation,
    integration
  });

  for (const userId of channelMemberIds) {
    graphqlPubsub.publish(
      `conversationClientMessageInserted:${subdomain}:${userId}`,
      {
        conversationClientMessageInserted: message,
        subdomain,
        conversation,
        integration
      }
    );
  }

  if (message.content) {
    sendCoreMessage({
      subdomain,
      action: "sendMobileNotification",
      data: {
        title: integration ? integration.name : "New message",
        body: message.content,
        receivers: channelMemberIds,
        data: {
          type: "conversation",
          id: conversation._id
        }
      }
    });
  }
};

export const getMessengerData = async (
  models: IModels,
  integration: IIntegrationDocument
) => {
  let messagesByLanguage: IMessengerDataMessagesItem | null = null;
  let messengerData = integration.messengerData;

  if (messengerData) {
    if (messengerData.toJSON) {
      messengerData = messengerData.toJSON();
    }

    const languageCode = integration.languageCode || "en";
    const messages = (messengerData || {}).messages;

    if (messages) {
      messagesByLanguage = messages[languageCode];
    }

    if (
      messengerData &&
      messengerData.hideWhenOffline &&
      messengerData.availabilityMethod === "auto"
    ) {
      const isOnline = await models.Integrations.isOnline(integration);
      if (!isOnline) {
        messengerData.showChat = false;
      }
    }
  }

  // knowledgebase app =======
  const kbApp: any = await models.MessengerApps.findOne({
    kind: "knowledgebase",
    "credentials.integrationId": integration._id
  });
  const topicId = kbApp && kbApp.credentials ? kbApp.credentials.topicId : null;

  // lead app ==========
  const leadApps: any[] = await models.MessengerApps.find({
    kind: "lead",
    "credentials.integrationId": integration._id
  });
  const formCodes = [] as string[];

  for (const app of leadApps) {
    if (app && app.credentials) {
      formCodes.push(app.credentials.formCode);
    }
  }

  // website app ============
  const websiteApps = await models.MessengerApps.find({
    kind: "website",
    "credentials.integrationId": integration._id
  });

  return {
    ...(messengerData || {}),
    messages: messagesByLanguage,
    knowledgeBaseTopicId: topicId,
    websiteApps,
    formCodes
  };
};

const createVisitor = async (subdomain: string, visitorId: string) => {
  const customer = await sendCoreMessage({
    subdomain,
    action: "customers.createCustomer",
    data: {
      state: "visitor",
      visitorId
    },
    isRPC: true
  });

  await sendCoreMessage({
    subdomain,
    action: "visitor.convertRequest",
    data: {
      visitorId
    }
  });

  return customer;
};


const widgetMutations = {



  async widgetsLeadIncreaseViewCount(
    _root,
    { formId }: { formId: string },
    { models }: IContext
  ) {
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
    { models, subdomain, user }: IContext
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
    const brand = await sendCoreMessage({
      subdomain,
      action: "brands.findOne",
      data: {
        query: {
          code: brandCode
        }
      },
      isRPC: true,
      defaultValue: {}
    });

    if (!brand) {
      throw new Error("Invalid configuration");
    }

    // find integration
    const integration = await models.Integrations.findOne({
      brandId: brand._id,
      kind: "messenger"
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    let customer;

    if (cachedCustomerId || email || phone || code) {
      customer = await sendCoreMessage({
        subdomain,
        action: "customers.getWidgetCustomer",
        data: {
          integrationId: integration._id,
          cachedCustomerId,
          email,
          phone,
          code
        },
        isRPC: true
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
        ? await sendCoreMessage({
            subdomain,
            action: "customers.updateMessengerCustomer",
            data: {
              _id: customer._id,
              doc,
              customData
            },
            isRPC: true
          })
        : await sendCoreMessage({
            subdomain,
            action: "customers.createMessengerCustomer",
            data: {
              doc,
              customData
            },
            isRPC: true
          });
    }

    if (visitorId) {
      await sendCoreMessage({
        subdomain,
        action: "visitor.createOrUpdate",
        data: {
          visitorId,
          integrationId: integration._id,
          scopeBrandIds: [brand._id]
        }
      });
    }

    // get or create company
    if (companyData && companyData.name) {
      let company = await sendCoreMessage({
        subdomain,
        action: "companies.findOne",
        data: companyData,
        isRPC: true
      });

      const { customFieldsData, trackedData } = await sendCoreMessage({
        subdomain,
        action: "fields.generateCustomFieldsData",
        data: {
          customData: companyData,
          contentType: "core:company"
        },
        isRPC: true
      });

      companyData.customFieldsData = customFieldsData;
      companyData.trackedData = trackedData;

      if (!company) {
        companyData.primaryName = companyData.name;
        companyData.names = [companyData.name];

        company = await sendCoreMessage({
          subdomain,
          action: "companies.createCompany",
          data: {
            ...companyData,
            scopeBrandIds: [brand._id]
          },
          isRPC: true
        });
      } else {
        company = await sendCoreMessage({
          subdomain,
          action: "companies.updateCompany",
          data: {
            _id: company._id,
            doc: companyData,
            scopeBrandIds: [brand._id]
          },
          isRPC: true
        });
      }

      if (customer && company) {
        // add company to customer's companyIds list
        await sendCoreMessage({
          subdomain,
          action: "conformities.create",
          data: {
            mainType: "customer",
            mainTypeId: customer._id,
            relType: "company",
            relTypeId: company._id
          }
        });
      }
    }

    if (!integration.isConnected) {
      await models.Integrations.updateOne(
        { _id: integration._id },
        { $set: { isConnected: true } }
      );

      await sendCoreMessage({
        subdomain,
        action: "registerOnboardHistory",
        data: {
          type: "erxesMessagerConnect",
          user
        }
      });
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
    { models, subdomain }: IContext
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
          integrationConfigs = await sendIntegrationsMessage({
            subdomain,
            action: "api_to_integrations",
            data: {
              action: "getConfigs"
            },
            isRPC: true
          });
        } catch (e) {
          debugError(e);
        }

        const timeDelay = integrationConfigs.find(
          config => config.code === "VIDEO_CALL_TIME_DELAY_BETWEEN_REQUESTS"
        ) || { value: "0" };

        const timeDelayIntValue = parseInt(timeDelay.value || "0", 10);

        const timeDelayValue = isNaN(timeDelayIntValue) ? 0 : timeDelayIntValue;

        if (messageTime + timeDelayValue * 1000 > nowTime) {
          const defaultValue = "Video call request has already sent";

          const messageForDelay = integrationConfigs.find(
            config => config.code === "VIDEO_CALL_MESSAGE_FOR_TIME_DELAY"
          ) || { value: defaultValue };

          throw new Error(messageForDelay.value || defaultValue);
        }
      }
    }

    const conversationContent = strip(message || "").substring(0, 100);

    let { customerId } = args;

    if (visitorId && !customerId) {
      const customer = await createVisitor(subdomain, visitorId);

      customerId = customer._id;
    }

    // customer can write a message
    // to the closed conversation even if it's closed
    let conversation;

    const integration =
      (await models.Integrations.findOne({ _id: integrationId })) ||
      ({} as any);
    const messengerData = integration.messengerData || {};
    const { botEndpointUrl, botShowInitialMessage } = messengerData;

    const HAS_BOTENDPOINT_URL = (botEndpointUrl || "").length > 0;

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
          visitorId: ""
        }
      }
    );

    // mark customer as active
    await sendCoreMessage({
      subdomain,
      action: "customers.markCustomerAsActive",
      data: {
        customerId: conversation.customerId
      },
      isRPC: true
    });

    await pConversationClientMessageInserted(models, subdomain, msg);

    graphqlPubsub.publish(`conversationMessageInserted:${msg.conversationId}`, {
      conversationMessageInserted: msg
    });

    // bot message ================
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
            typing: true
          }
        }
      );

      try {
        const botRequest = await fetch(
          `${botEndpointUrl}/${conversation._id}`,
          {
            method: "POST",
            body: JSON.stringify({
              type: "text",
              text: message
            }),
            headers: { "Content-Type": "application/json" }
          }
        ).then(r => r.json());

        const { responses } = botRequest;

        const botData =
          responses.length !== 0
            ? responses
            : [
                {
                  type: "text",
                  text: AUTO_BOT_MESSAGES.NO_RESPONSE
                }
              ];

        const botMessage = await models.ConversationMessages.createMessage({
          conversationId: conversation._id,
          customerId,
          contentType,
          botData
        });

        graphqlPubsub.publish(
          `conversationBotTypingStatus:${msg.conversationId}`,
          {
            conversationBotTypingStatus: {
              conversationId: msg.conversationId,
              typing: false
            }
          }
        );

        graphqlPubsub.publish(
          `conversationMessageInserted:${botMessage.conversationId}`,
          {
            conversationMessageInserted: botMessage
          }
        );
      } catch (e) {
        debugError(`Failed to connect to BOTPRESS: ${e.message}`);
      }
    }

    const customerLastStatus =
      (await redis.get(`customer_last_status_${customerId}`)) || "left";

    if (customerLastStatus === "left" && customerId) {
      await redis.set(`customer_last_status_${customerId}`, "joined");

      // customer has joined + time
      const conversationMessages =
        await models.Conversations.changeCustomerStatus(
          "joined",
          customerId,
          conversation.integrationId
        );

      for (const mg of conversationMessages) {
        graphqlPubsub.publish(
          `conversationMessageInserted:${mg.conversationId}`,
          {
            conversationMessageInserted: mg
          }
        );
      }

      // notify as connected
      graphqlPubsub.publish(`customerConnectionChanged:${customerId}`, {
        customerConnectionChanged: {
          _id: customerId,
          status: "connected"
        }
      });
    }

    await sendToWebhook({
      subdomain,
      data: {
        action: "create",
        type: "inbox:customerMessages",
        params: msg
      }
    });

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

  async widgetsSaveCustomerGetNotified(
    _root,
    args,
    { models, subdomain }: IContext
  ) {
    const { visitorId, customerId } = args;

    if (visitorId && !customerId) {
      const customer = await createVisitor(subdomain, visitorId);
      args.customerId = customer._id;

      await models.ConversationMessages.updateVisitorEngageMessages(
        visitorId,
        customer._id
      );
      await models.Conversations.updateMany(
        {
          visitorId
        },
        { $set: { customerId: customer._id, visitorId: "" } }
      );
    }

    return sendCoreMessage({
      subdomain,
      action: "customers.saveVisitorContactInfo",
      data: args,
      isRPC: true
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
      browserInfo
    }: { visitorId?: string; customerId?: string; browserInfo: IBrowserInfo },
    { subdomain }: IContext
  ) {
    // update location

    if (customerId) {
      sendCoreMessage({
        subdomain,
        action: "customers.updateLocation",
        data: {
          customerId,
          browserInfo
        }
      });

      sendCoreMessage({
        subdomain,
        action: "customers.updateSession",
        data: {
          customerId
        }
      });
    }

    if (visitorId) {
      await sendCoreMessage({
        subdomain,
        action: "visitor.updateEntry",
        data: {
          data: {
            visitorId,
            location: browserInfo
          }
        }
      });
    }

    try {
      await trackViewPageEvent(subdomain, {
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

  async widgetsSendTypingInfo(
    _root,
    args: { conversationId: string; text?: string }
  ) {
    graphqlPubsub.publish(
      `conversationClientTypingStatusChanged:${args.conversationId}`,
      {
        conversationClientTypingStatusChanged: args
      }
    );

    return "ok";
  },

  async widgetsSendEmail(
    _root,
    args: IWidgetEmailParams,
    { subdomain, models }: IContext
  ) {
    const { toEmails, fromEmail, title, content, customerId, formId } = args;

    const attachments = args.attachments || [];

    // do not use Customers.getCustomer() because it throws error if not found
    const customer = await sendCoreMessage({
      subdomain,
      action: "customers.findOne",
      data: {
        _id: customerId
      },
      isRPC: true
    });

    const form = await sendCoreMessage({
      subdomain,
      action: "formsFindOne",
      data: { _id: formId },
      isRPC: true
    });

    let finalContent = content;

    if (customer && form) {
      const replacedContent = await new EditorAttributeUtil(
        `${process.env.DOMAIN}/gateway/pl:core`,
        await getServices(),
        subdomain
      ).replaceAttributes({
        content,
        customer,
        user:
          (await sendCoreMessage({
            subdomain,
            action: "users.findOne",
            data: {
              _id: form.createdUserId
            },
            isRPC: true,
            defaultValue: {}
          })) || {}
      });

      finalContent = replacedContent || "";
    }

    let mailAttachment: any = [];

    if (attachments.length > 0) {
      mailAttachment = attachments.map(file => {
        return {
          filename: file.name || "",
          path: file.url || ""
        };
      });
    }

    const integration = await models.Integrations.findOne({
      formId
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    const { verifyEmail = false } = integration.leadData || {};

    if (verifyEmail) {
      const domain = getEnv({ name: "DOMAIN", subdomain })
        ? `${getEnv({ name: "DOMAIN", subdomain })}/gateway`
        : "http://localhost:4000";

      for (const email of toEmails) {
        const params = Buffer.from(
          JSON.stringify({
            email,
            formId,
            customerId
          })
        ).toString("base64");

        const emailValidationUrl = `${domain}/verify?p=${params}`;

        const languageCode = integration.languageCode || "en";
        const text =
          VERIFY_EMAIL_TRANSLATIONS[languageCode] ||
          VERIFY_EMAIL_TRANSLATIONS.en;

        finalContent += `\n<p><a href="${emailValidationUrl}" target="_blank">${text}</a></p>`;

        await sendCoreMessage({
          subdomain,
          action: "sendEmail",
          data: {
            toEmails: [email],
            fromEmail,
            title,
            template: { data: { content: finalContent } },
            attachments: mailAttachment
          }
        });
      }

      return;
    }

    await sendCoreMessage({
      subdomain,
      action: "sendEmail",
      data: {
        toEmails,
        fromEmail,
        title,
        template: { data: { content: finalContent } },
        attachments: mailAttachment
      }
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
    { models, subdomain }: IContext
  ) {
    const integration =
      (await models.Integrations.findOne({ _id: integrationId })) ||
      ({} as any);
    const { botEndpointUrl } = integration.messengerData;

    if (visitorId && !customerId) {
      const customer = await createVisitor(subdomain, visitorId);
      customerId = customer._id;
    }

    let sessionId: string | null | undefined = conversationId;

    if (!conversationId) {
      sessionId = await redis.get(
        `bot_initial_message_session_id_${integrationId}`
      );

      const conversation = await models.Conversations.createConversation({
        customerId,
        integrationId,
        operatorStatus: CONVERSATION_OPERATOR_STATUS.BOT,
        status: CONVERSATION_STATUSES.CLOSED
      });

      conversationId = conversation._id;

      const initialMessageBotData = await redis.get(
        `bot_initial_message_${integrationId}`
      );

      await models.ConversationMessages.createMessage({
        conversationId: conversation._id,
        customerId,
        botData: JSON.parse(initialMessageBotData || "{}")
      });
    }

    // create customer message
    const msg = await models.ConversationMessages.createMessage({
      conversationId,
      customerId,
      content: message
    });

    graphqlPubsub.publish(`conversationMessageInserted:${msg.conversationId}`, {
      conversationMessageInserted: msg
    });

    let botMessage;
    let botData;

    if (type !== BOT_MESSAGE_TYPES.SAY_SOMETHING) {
      const botRequest = await fetch(`${botEndpointUrl}/${sessionId}`, {
        method: "POST",
        body: JSON.stringify({
          type: "text",
          text: payload
        }),
        headers: { "Content-Type": "application/json" }
      }).then(r => r.json());

      const { responses } = botRequest;

      botData =
        responses.length !== 0
          ? responses
          : [
              {
                type: "text",
                text: AUTO_BOT_MESSAGES.NO_RESPONSE
              }
            ];
    } else {
      botData = [
        {
          type: "text",
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

    graphqlPubsub.publish(
      `conversationMessageInserted:${botMessage.conversationId}`,
      {
        conversationMessageInserted: botMessage
      }
    );

    return botMessage;
  },

  async widgetGetBotInitialMessage(
    _root,
    { integrationId }: { integrationId: string },
    { models }: IContext
  ) {
    const sessionId = `_${Math.random().toString(36).substr(2, 9)}`;

    await redis.set(
      `bot_initial_message_session_id_${integrationId}`,
      sessionId
    );

    const integration =
      (await models.Integrations.findOne({ _id: integrationId })) ||
      ({} as any);
    const { botEndpointUrl } = integration.messengerData;

    const botRequest = await fetch(`${botEndpointUrl}/${sessionId}`, {
      method: "POST",
      body: JSON.stringify({
        type: "text",
        text: "getStarted"
      }),
      headers: { "Content-Type": "application/json" }
    }).then(r => r.json());

    await redis.set(
      `bot_initial_message_${integrationId}`,
      JSON.stringify(botRequest.responses)
    );

    return { botData: botRequest.responses };
  },
};

export default widgetMutations;
