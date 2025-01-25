import * as moment from "moment";
import { IModels } from "../connectionResolver";
import { debugError } from "../debuggers";
import { sendAutomationsMessage } from "../messageBroker";
import { IBotDocument } from "../models/definitions/bots";
import { IConversation } from "../models/definitions/conversations";

import { Message } from "./types";
import {
  checkContentConditions,
  generateBotData,
  generatePayloadString,
  getUrl
} from "./utils";
import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";

const generateMessages = async (
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
          triggerType: "widgets:messages",
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

const sendMessage = async (
  models,
  bot: IBotDocument,
  { senderId, recipientId, integration, message, tag }: Message,
  isLoop?: boolean
) => {
  try {
    let payload;
    if (message && message.text) {
      payload = {
        messaging_product: "widgets",
        to: recipientId,
        type: "text",
        text: { body: message.text || "Default text message" },
        tag
      };
    } else if (message && message.attachment) {
      const { text, buttons } = message.attachment.payload;
      if (!Array.isArray(buttons) || buttons.length === 0) {
        throw new Error("No valid buttons provided in attachment payload");
      }
      payload = {
        messaging_product: "widgets",
        to: recipientId,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: text || "Default button text"
          },
          action: {
            buttons: Array.isArray(buttons)
              ? buttons.map((btn, index) => ({
                  type: "reply",
                  reply: {
                    id: `button_${index}`,
                    title: btn.title || `Button ${index + 1}`
                  }
                }))
              : []
          }
        },
        tag
      };
    }

    // const resp = await sendReply(
    //   models,
    //   `${senderId}/messages`,
    //   payload,
    //   integration.erxesApiId
    // );
    // if (!resp) {
    //   return;
    // }
    // return resp;
  } catch (error) {
    if (
      error.message.includes(
        "This message is sent outside of allowed window"
      ) &&
      bot?.tag &&
      !isLoop
    ) {
      await sendMessage(
        models,
        bot,
        {
          senderId,
          recipientId,
          integration,
          message,
          tag: bot?.tag
        },
        true
      );
    }

    debugError(error.message);
    throw new Error(error.message);
  }
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
  // const { recipientId, senderId, botId } = conversation;

  // const customer = await models.Customers.findOne({
  //   userId: senderId
  // }).lean();

  // if (!customer) {
  //   throw new Error(`Customer not found`);
  // }

  // const bot = await models.Bots.findOne({ _id: botId }, { tag: 1 }).lean();

  // if (!bot) {
  //   throw new Error(`Bot not found`);
  // }

  // return {
  //   conversation,
  //   integration,
  //   customer,
  //   bot,
  //   recipientId,
  //   senderId,
  //   botId
  // };
};

export const actionCreateMessage = async (
  models: IModels,
  subdomain,
  action,
  execution
) => {
  const { target, triggerType, triggerConfig } = execution || {};
  const { config } = action || {};

  if (!["widgets:messages"].includes(triggerType)) {
    throw new Error("Unsupported trigger type");
  }
  // const {
  //   conversation,
  //   customer,
  //   integration,
  //   bot,
  //   senderId,
  //   recipientId,
  //   botId
  // } = await getData(models, subdomain, triggerType, target, triggerConfig);

  let result: any[] = [];

  // try {
  //   const messages = await generateMessages(
  //     subdomain,
  //     config,
  //     conversation,
  //     customer
  //   );

  //   if (!messages?.length) {
  //     return "There are no generated messages to send.";
  //   }

  //   for (const { botData, inputData, ...message } of messages) {
  //     let resp;

  //     try {
  //       resp = await sendMessage(models, bot, {
  //         senderId,
  //         recipientId,
  //         integration,
  //         message
  //       });
  //     } catch (error) {
  //       debugError(error.message);
  //       throw new Error(error.message);
  //     }

  //     const conversationMessage = await models.ConversationMessages.addMessage({
  //       conversationId: conversation._id as string,
  //       content: "<p>Bot Message</p>",
  //       internal: false,
  //       mid: resp.message_id,
  //       botId,
  //       botData,
  //       fromBot: true
  //     });

  //     sendInboxMessage({
  //       subdomain,
  //       action: "conversationClientMessageInserted",
  //       data: {
  //         ...conversationMessage.toObject(),
  //         conversationId: conversation.erxesApiId
  //       }
  //     });

  //     result.push(conversationMessage);
  //   }

  //   const { optionalConnects = [] } = config;

  //   if (!optionalConnects?.length) {
  //     return result;
  //   }
  //   return {
  //     result,
  //     objToWait: generateObjectToWait({
  //       messages: config?.messages || [],
  //       conversation: conversation as { _id: string } & IConversation,
  //       customer,
  //       optionalConnects
  //     })
  //   };
  // } catch (error) {
  //   debugError(error.message);
  //   throw new Error(error.message);
  // }
};
