import * as moment from "moment";
import { IModels } from "../connectionResolver";
import { debugError } from "../debuggers";
import { sendCoreMessage, sendAutomationsMessage } from "../messageBroker";
import { IConversation } from "../models/definitions/conversations";
import {
  checkContentConditions,
  generateBotData,
  generatePayloadString,
  getUrl
} from "./utils";
import { publishMessage } from "../graphql/resolvers/conversationMutations";

export const generateMessages = async (
  subdomain: string,
  config: any,
  conversation: IConversation,
  customer: any
) => {
  let { messages = [] } = config || {};

  const generateButtons = (buttons: any[] = []) => {
    const generatedButtons: any = [];

    for (const button of buttons) {
      const obj: any = {
        type: "postback",
        title: (button.text || "").trim(),
        payload: generatePayloadString(
          conversation,
          button,
          customer?.erxesApiId
        )
      };

      if (button.link) {
        delete obj.payload;
        obj.type = "web_url";
        obj.url = button.link;
      }

      generatedButtons.push(obj);
    }

    return generatedButtons;
  };

  const quickRepliesIndex = messages.findIndex(
    ({ type }) => type === "quickReplies"
  );

  if (quickRepliesIndex !== -1) {
    const quickRepliesMessage = messages.splice(quickRepliesIndex, 1)[0];
    messages.push(quickRepliesMessage);
  }
  const generatedMessages: any[] = [];

  for (const {
    type,
    buttons,
    text,
    cards = [],
    quickReplies,
    image = "",
    video = "",
    audio = "",
    input
  } of messages) {
    const botData = generateBotData(subdomain, {
      type,
      buttons,
      text,
      cards,
      quickReplies,
      image
    });

    if (["text", "input"].includes(type) && !buttons?.length) {
      generatedMessages.push({
        text: input ? input.text : text,
        botData,
        inputData: input
      });
    }

    if (["text", "input"].includes(type) && !!buttons?.length) {
      generatedMessages.push({
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: (input ? input.text : text || "").trim(),
            buttons: generateButtons(buttons)
          }
        },
        botData,
        inputData: input
      });
    }

    if (type === "card" && cards?.length > 0) {
      generatedMessages.push({
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: cards.map(
              ({ title = "", subtitle = "", image = "", buttons = [] }) => ({
                title,
                subtitle,
                image_url: getUrl(subdomain, image),
                buttons: generateButtons(buttons)
              })
            )
          }
        },
        botData
      });
    }

    if (type === "quickReplies") {
      generatedMessages.push({
        text: text || "",
        quick_replies: quickReplies.map((quickReply) => ({
          content_type: "text",
          title: quickReply?.text || "",
          payload: generatePayloadString(
            conversation,
            quickReply,
            customer?.erxesApiId
          )
        })),
        botData
      });
    }

    if (["image", "audio", "video"].includes(type)) {
      const url = image || video || audio;

      url &&
        generatedMessages.push({
          attachment: {
            type,
            payload: {
              url: getUrl(subdomain, url)
            }
          },
          botData
        });
    }
  }

  return generatedMessages;
};

export const checkMessageTrigger = async (subdomain, { target, config }) => {
  const { conditions = [], botId } = config;

  if (target.botId !== botId) {
    return;
  }
  const payload = target?.payload || {};
  const { persistentMenuId, isBackBtn } = payload;

  if (persistentMenuId && isBackBtn) {
    await sendAutomationsMessage({
      subdomain,
      action: "excutePrevActionExecution",
      data: {
        query: {
          triggerType: "inbox:messages",
          "target.botId": botId,
          "target.conversationId": target.conversationId,
          "target.customerId": target.customerId
        }
      },
      isRPC: true
    }).catch((error) => {
      debugError(error.message);
    });

    return false;
  }
  for (const {
    isSelected,
    type,
    persistentMenuIds,
    conditions: directMessageCondtions = []
  } of conditions) {
    if (isSelected) {
      if (type === "getStarted" && target.content === "Get Started") {
        return true;
      }

      if (type === "persistentMenu" && payload) {
        if ((persistentMenuIds || []).includes(String(persistentMenuId))) {
          return true;
        }
      }

      if (type === "direct") {
        if (directMessageCondtions?.length > 0) {
          return !!checkContentConditions(
            target?.content || "",
            directMessageCondtions
          );
        } else if (!!target?.content) {
          return true;
        }
      }
    }
    continue;
  }
};
const generateObjectToWait = ({
  messages = [],
  optionalConnects = [],
  conversation,
  customer
}: {
  messages: any[];
  optionalConnects: any[];
  conversation: { _id: string } & IConversation;
  customer: any;
}) => {
  const obj: any = {};
  const general: any = {
    conversationId: conversation._id,
    customerId: customer.erxesApiId
  };
  let propertyName = "payload.btnId";

  if (messages.some((msg) => msg.type === "input")) {
    const inputMessageConfig =
      messages.find((msg) => msg.type === "input")?.input || {};

    if (inputMessageConfig.timeType === "day") {
      obj.startWaitingDate = moment()
        .add(inputMessageConfig.value || 0, "day")
        .toDate();
    }

    if (inputMessageConfig.timeType === "hour") {
      obj.startWaitingDate = moment()
        .add(inputMessageConfig.value || 0, "hour")
        .toDate();
    }
    if (inputMessageConfig.timeType === "minute") {
      obj.startWaitingDate = moment()
        .add(inputMessageConfig.value || 0, "minute")
        .toDate();
    }

    const actionIdIfNotReply =
      optionalConnects.find(
        (connect) => connect?.optionalConnectId === "ifNotReply"
      )?.actionId || null;

    obj.waitingActionId = actionIdIfNotReply;

    propertyName = "botId";
  } else {
    obj.startWaitingDate = moment().add(24, "hours").toDate();
    obj.waitingActionId = null;
  }

  return {
    ...obj,
    objToCheck: {
      propertyName,
      general
    }
  };
};

const getData = async (
  models: IModels,
  subdomain: string,
  triggerType: string,
  target: any,
  config: any
) => {
  const conversation = await models.Conversations.findOne({
    _id: target?.conversationId
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const integration = await models.Integrations.findOne({
    _id: conversation.integrationId
  });

  if (!integration) {
    throw new Error("Integration not found");
  }
  const { botId } = conversation;

  const customer = await sendCoreMessage({
    subdomain,
    action: "customers.findOne",
    data: {
      _id: conversation.customerId
    },
    isRPC: true
  });

  return {
    conversation,
    integration,
    customer,
    botId
  };
};

export const actionCreateMessage = async (
  models: IModels,
  subdomain,
  action,
  execution
) => {
  const { target, triggerType, triggerConfig } = execution || {};
  const { config } = action || {};
  if (!["inbox:messages"].includes(triggerType)) {
    throw new Error("Unsupported trigger type");
  }

  const { conversation, customer, integration, botId } = await getData(
    models,
    subdomain,
    triggerType,
    target,
    triggerConfig
  );

  try {
    const messages = await generateMessages(
      subdomain,
      config,
      conversation,
      customer
    );
    if (!messages?.length) {
      return "There are no generated messages to send.";
    }

    for (const { botData, inputData, attachment, ...message } of messages) {
      const conversationMessage = await models.ConversationMessages.addMessage({
        conversationId: conversation._id,
        content: "<p>Bot Message</p>",
        internal: false,
        botData,
        fromBot: true
      });
      const dbMessage = await models.ConversationMessages.getMessage(
        conversationMessage._id
      );

      await publishMessage(models, dbMessage, conversation.customerId);

      const { optionalConnects = [] } = config;

      if (!optionalConnects?.length) {
        return dbMessage;
      }

      return {
        result: dbMessage,
        objToWait: generateObjectToWait({
          messages: config?.messages || [],
          conversation,
          customer,
          optionalConnects
        })
      };
    }
  } catch (error) {
    debugError(error.message);
    throw new Error(error.message);
  }
};
