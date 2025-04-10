import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import { Activity } from "botbuilder";
import { IIntegrationDocument } from "./models/Integrations";
import { debugInfo } from "@erxes/api-utils/src/debuggers";
import { IModels } from "./connectionResolver";
import { INTEGRATION_KINDS } from "./constants";
import { debugError } from "./debuggers";
import { sendAutomationsMessage, sendInboxMessage } from "./messageBroker";
import { getOrCreateCustomer } from "./store";
import { IChannelData } from "./types";
import { IConversationMessageDocument } from "./models/definitions/conversationMessages";

const checkIsBot = async (models: IModels, message, recipientId) => {
  let selector: any = { pageId: recipientId };

  if (message?.payload) {
    const payload = JSON.parse(message?.payload || "{}");
    if (payload.botId) {
      selector = { _id: payload.botId };
    }
  }

  const bot = await models.Bots.findOne(selector);

  return bot;
};

const handleAutomation = async (
  subdomain: string,
  {
    conversationMessage,
    payload,
    adData
  }: {
    conversationMessage: IConversationMessageDocument;
    payload: any;
    adData: any;
  }
) => {
  const target = { ...conversationMessage.toObject() };
  let type = "facebook:messages";

  if (payload) {
    target.payload = JSON.parse(payload || "{}");
  }

  if (adData) {
    target.adData = adData;
    type = "facebook:ads";
  }

  await sendAutomationsMessage({
    subdomain,
    action: "trigger",
    data: {
      type,
      targets: [target]
    },
    isRPC: true,
    defaultValue: null
  })
    .catch((err) => {
      debugError(`Error sending automation message: ${err.message}`);
      throw err;
    })
    .then(() => {
      debugInfo(`Sent message successfully`);
    });
};

const receiveMessage = async (
  models: IModels,
  subdomain: string,
  integration: IIntegrationDocument,
  activity: Activity
) => {
  let {
    recipient,
    sender,
    timestamp,
    attachments = [],
    message,
    postback
  } = activity.channelData as IChannelData;
  let adData;
  let text = message?.text || "";
  if (!text && !message && !!postback) {
    text = postback.title;

    message = {
      mid: postback.mid
    };

    if (postback.payload) {
      message.payload = postback.payload;
    }
  }
  if (message.quick_reply) {
    message.payload = message.quick_reply.payload;
  }

  const userId = sender.id;
  const pageId = recipient.id;
  const kind = INTEGRATION_KINDS.MESSENGER;

  // get or create customer
  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    kind
  );

  // get conversation
  let conversation = await models.Conversations.findOne({
    senderId: userId,
    recipientId: recipient.id
  });

  const bot = await checkIsBot(models, message, recipient.id);
  const botId = bot?._id;

  if (message.referral && bot) {
    const referral = message.referral;
    adData = {
      type: "text",
      text: `<div class="ads"> 
              <img src="${referral.ads_context_data.photo_url}" alt="${referral.ads_context_data.ad_title}"/>
              <h5>${referral.ads_context_data.ad_title}</h5>
            </div>`,
      mid: message.mid,
      adId: referral.ad_id,
      postId: referral.ads_context_data.post_id,
      messageText: text,
      pageId: recipient.id
    };
  }

  // <a href="${referral.ads_context_data.post_id}">See ads in facebook</a>

  // create conversation
  if (!conversation) {
    // save on integrations db

    try {
      conversation = await models.Conversations.create({
        timestamp,
        senderId: userId,
        recipientId: recipient.id,
        content: text,
        integrationId: integration._id,
        isBot: !!botId,
        botId
      });
    } catch (e) {
      throw new Error(
        e.message.includes("duplicate")
          ? "Concurrent request: conversation duplication"
          : e
      );
    }
  } else {
    const bot = await models.Bots.findOne({ _id: botId });

    if (bot) {
      conversation.botId = botId;
    }
    conversation.content = text || "";
  }

  const formattedAttachments = (attachments || [])
    .filter((att) => att.type !== "fallback")
    .map((att) => ({
      type: att.type,
      url: att.payload ? att.payload.url : ""
    }));

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
          content: text || "",
          attachments: formattedAttachments,
          conversationId: conversation.erxesApiId,
          updatedAt: timestamp
        })
      },
      isRPC: true
    });

    conversation.erxesApiId = apiConversationResponse._id;

    await conversation.save();
  } catch (e) {
    await models.Conversations.deleteOne({ _id: conversation._id });
    throw new Error(e);
  }
  // get conversation message
  let conversationMessage = await models.ConversationMessages.findOne({
    mid: message.mid
  });

  if (!conversationMessage) {
    try {
      if (adData) {
        const adsMessage = await models.ConversationMessages.addMessage({
          conversationId: conversation._id,
          content: "<p>Conversation started from Facebook ads </p>",
          botId,
          botData: [adData],
          fromBot: true,
          mid: adData.mid,
          createdAt: new Date(new Date(timestamp).getTime() - 500)
        });

        await sendInboxMessage({
          subdomain,
          action: "conversationClientMessageInserted",
          data: {
            ...adsMessage.toObject(),
            conversationId: conversation.erxesApiId
          }
        });
      }
      const created = await models.ConversationMessages.create({
        conversationId: conversation._id,
        mid: message.mid,
        createdAt: timestamp,
        content: text,
        customerId: customer.erxesApiId,
        attachments: formattedAttachments,
        botId
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
      conversationMessage = created;

      await handleAutomation(subdomain, {
        conversationMessage,
        payload: message?.payload,
        adData
      });
    } catch (e) {
      throw new Error(
        e.message.includes("duplicate")
          ? "Concurrent request: conversation message duplication"
          : e
      );
    }
  }
};

export default receiveMessage;
