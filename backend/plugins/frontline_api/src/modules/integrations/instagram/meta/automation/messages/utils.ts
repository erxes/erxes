import { getEnv, graphqlPubsub } from "erxes-api-shared/utils";
import { IInstagramConversation } from "../../../@types/conversations";
import { ICustomer } from "../../../@types/customers";
import {
    checkContentConditions,
    generateBotData,
    generatePayloadString,
    getUrl
  } from "../utils/messageUtils";
import { IModels } from "~/connectionResolvers";
import { debugError } from "../../../debuggers";
import { sendReply } from "../../../utils";
import { IInstagramBotDocument } from "../../../@types/bots";

export const generateMessages = async (
    subdomain: string,
    config: any,
    conversation: IInstagramConversation,
    customer: ICustomer
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


export const getData = async (
    models: IModels,
    subdomain: string,
    triggerType: string,
    target: any,
    config: any
  ) => {
    if (triggerType === "instagram:comments") {
      const { senderId, recipientId, erxesApiId } = target;
  
      const { botId } = config;
  
      let conversation = await models.InstagramConversation.findOne({
        senderId,
        recipientId
      });
  
      const customer = await models.InstagramCustomers.findOne({
        erxesApiId: target.customerId
      });
  
      if (!customer) {
        throw new Error(
          `Error occurred during send message with trigger type ${triggerType}`
        );
      }
      const integration = await models.InstagramIntegrations.findOne({
        erxesApiId: customer?.integrationId
      });
  
      if (!integration) {
        throw new Error(
          `Error occurred during send message with trigger type ${triggerType}`
        );
      }
  
      const bot = await models.InstagramBots.findOne({ _id: botId });
  
      if (!bot) {
        throw new Error("Bot not found");
      }
  
      const DOMAIN = getEnv({
        name: "DOMAIN",
        subdomain
      });
  
      const timestamp = new Date();
      if (!conversation) {
        try {
          conversation = await models.InstagramConversation.create({
            timestamp,
            senderId,
            recipientId,
            content: "Start conversation from comment",
            integrationId: integration._id,
            isBot: true,
            botId
          });
        } catch (e) {
          throw new Error(
            e.message.includes("duplicate")
              ? "Concurrent request: conversation duplication"
              : e
          );
        }
      }
  
      // save on api
      try {
        const apiConversationResponse = await sendInboxMessage({
          subdomain,
          action: "integrations.receive",
          data: {
            action: "create-or-update-conversation",
            payload: JSON.stringify({
              customerId: customer.erxesApiId,
              integrationId: integration.erxesApiId,
              content: "Start conversation from comment",
              conversationId: conversation.erxesApiId,
              updatedAt: timestamp
            })
          },
          isRPC: true
        });
  
        conversation.erxesApiId = apiConversationResponse._id;
  
        await conversation.save();
      } catch (e) {
        await models.InstagramConversation.deleteOne({ _id: conversation._id });
        throw new Error(e);
      }
  
      const created = await models.InstagramConversationMessage.addMessage({
        conversationId: conversation._id as string, // Type assertion
        content: "<p>Bot Message</p>",
        internal: true,
        mid: "",
        botId,
        botData: [
          {
            type: "text",
            text: `${DOMAIN}/inbox/index?_id=${erxesApiId}`
          }
        ],
        fromBot: true
      });
  
      await sendInboxMessage({
        subdomain,
        action: "conversationClientMessageInserted",
        data: {
          ...created.toObject(),
          conversationId: conversation.erxesApiId
        }
      });
  
      graphqlPubsub.publish(
        `conversationMessageInserted:${conversation.erxesApiId}`,
        {
          conversationMessageInserted: {
            ...created.toObject(),
            conversationId: conversation.erxesApiId
          }
        }
      );
  
      return {
        conversation,
        integration,
        customer,
        bot,
        recipientId,
        senderId,
        botId
      };
    }
  
    const conversation = await models.InstagramConversation.findOne({
      _id: target?.conversationId
    });
  
    if (!conversation) {
      throw new Error("Conversation not found");
    }
  
    const integration = await models.InstagramIntegrations.findOne({
      _id: conversation.integrationId
    });
  
    if (!integration) {
      throw new Error("Integration not found");
    }
    const { recipientId, senderId, botId } = conversation;
  
    const customer = await models.InstagramCustomers.findOne({
      userId: senderId
    }).lean();
  
    if (!customer) {
      throw new Error(`Customer not found`);
    }
  
    const bot = await models.InstagramBots.findOne({ _id: botId }, { tag: 1 }).lean();
  
    if (!bot) {
      throw new Error(`Bot not found`);
    }
  
    return {
      conversation,
      integration,
      customer,
      bot,
      recipientId,
      senderId,
      botId
    };
  };

export const generateObjectToWait = ({
  messages = [],
  optionalConnects = [],
  conversation,
  customer
}: {
  messages: any[];
  optionalConnects: any[];
  conversation: { _id: string } & IInstagramConversation;
  customer: ICustomer;
}) => {
  const obj: any = {};
  const general: any = {
    conversationId: conversation._id,
    customerId: customer.erxesApiId
  };
  let propertyName = "payload.btnId";

//   if (messages.some((msg) => msg.type === "input")) {
//     const inputMessageConfig =
//       messages.find((msg) => msg.type === "input")?.input || {};

//     if (inputMessageConfig.timeType === "day") {
//       obj.startWaitingDate = moment()
//         .add(inputMessageConfig.value || 0, "day")
//         .toDate();
//     }

//     if (inputMessageConfig.timeType === "hour") {
//       obj.startWaitingDate = moment()
//         .add(inputMessageConfig.value || 0, "hour")
//         .toDate();
//     }
//     if (inputMessageConfig.timeType === "minute") {
//       obj.startWaitingDate = moment()
//         .add(inputMessageConfig.value || 0, "minute")
//         .toDate();
//     }

//     const actionIdIfNotReply =
//       optionalConnects.find(
//         (connect) => connect?.optionalConnectId === "ifNotReply"
//       )?.actionId || null;

//     obj.waitingActionId = actionIdIfNotReply;

//     propertyName = "botId";
//   } else {
//     obj.startWaitingDate = moment().add(24, "hours").toDate();
//     obj.waitingActionId = null;
//   }

  return {
    ...obj,
    objToCheck: {
      propertyName,
      general
    }
  };
};
  

export const sendMessage = async (
    models : IModels,
    bot: IInstagramBotDocument,
    { senderId, recipientId, integration, message, tag }: Message,
    isLoop?: boolean
  ) => {
    try {
      const resp = await sendReply(
        models,
        "me/messages",
        {
          recipient: { id: senderId },
          message,
          tag
        },
        integration.erxesApiId
      );
      if (!resp) {
        return;
      }
      return resp;
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