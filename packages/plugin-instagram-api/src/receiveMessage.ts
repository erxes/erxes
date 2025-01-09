import { IModels } from "./connectionResolver";
import { sendInboxMessage, sendAutomationsMessage } from "./messageBroker";
import { getOrCreateCustomer } from "./store";
import { IMessageData } from "./types";
import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import { INTEGRATION_KINDS } from "./constants";
import { debugError } from "./debuggers";
import { debugInfo } from "@erxes/api-utils/src/debuggers";
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
    conversationMessage: any;
    payload: any;
    adData: any;
  }
) => {
  const target = { ...conversationMessage.toObject() };
  let type = "instagram:messages";

  if (payload) {
    target.payload = JSON.parse(payload || "{}");
  }

  if (adData) {
    target.adData = adData;
    type = "instagram:ads";
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
  messageData: IMessageData
) => {
  const { recipient, sender, timestamp, postback, message } = messageData;

  let { text, attachments, mid, is_deleted, referral, quick_reply } =
    message || {};

  let adData;

  let updatedMessage = message || { mid: "", text: "", is_deleted: false }; //

  if (!text && !updatedMessage.text && postback) {
    text = postback.title;
    mid = postback.mid;

    updatedMessage = {
      mid: postback.mid,
      payload: postback.payload || undefined,
      text: postback.title,
      is_deleted: false
    };
  }

  if (quick_reply) {
    updatedMessage.payload = quick_reply.payload;
  }

  const integration = await models.Integrations.findOne({
    $and: [
      { instagramPageId: { $in: [recipient.id] } },
      { kind: INTEGRATION_KINDS.MESSENGER }
    ]
  });

  if (!integration) {
    throw new Error("Instagram Integration not found");
  }

  const userId = sender.id;
  const pageId = recipient.id;

  // Get or create the customer
  const { facebookPageTokensMap, facebookPageId } = integration;
  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    facebookPageId,
    INTEGRATION_KINDS.MESSENGER,
    facebookPageTokensMap
  );

  if (!customer) {
    throw new Error("Failed to get or create customer");
  }

  // Get or create the conversation
  let conversation = await models.Conversations.findOne({
    senderId: userId,
    recipientId: recipient.id
  });

  // Check if the sender is a bot
  const bot = await checkIsBot(models, messageData.message, recipient.id);
  const botId = bot?._id;
  if (messageData.message?.referral && bot) {
    const referral = messageData.message.referral;
    adData = {
      type: "text",
      text: `<div class="ads"> 
            <img src="${referral.ads_context_data.photo_url}" alt="${referral.ads_context_data.ad_title}"/>
            <h5>${referral.ads_context_data.ad_title}</h5>
          </div>`,
      mid: messageData.message.mid,
      adId: referral.ad_id,
      postId: referral.ads_context_data.post_id,
      messageText: messageData.message.text,
      pageId: messageData.recipient.id
    };
  }

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
    mid: mid
  });
  if (!conversationMessage) {
    if (adData) {
      const adsMessage = await models.ConversationMessages.addMessage({
        conversationId: conversation._id as string, // Type assertion here
        content: "<p>Conversation started from Instagram ads </p>",
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
          conversationId: conversation.erxesApiId as string // Type assertion here
        }
      });
    }

    // save on integrations db
    try {
      const createdMessage = await models.ConversationMessages.create({
        mid: mid,
        timestamp,
        senderId: userId,
        recipientId: recipient.id,
        content: text,
        integrationId: integration._id,
        conversationId: conversation._id,
        createdAt: timestamp,
        customerId: customer.erxesApiId,
        attachments: formattedAttachments,
        botId
      });
      conversationMessage = createdMessage;
      await handleMessageUpdate(
        createdMessage.toObject(),
        conversation.erxesApiId,
        subdomain
      );

      const payload = attachments?.[0]?.payload;

      await handleAutomation(subdomain, {
        conversationMessage,
        payload, // Pass the extracted payload
        adData
      });
    } catch (e) {
      throw new Error(
        e.message.includes("duplicate")
          ? "Concurrent request: conversation message duplication"
          : e
      );
    }
  } else if (is_deleted) {
    // Update message content if deleted
    const updatedMessage = await models.ConversationMessages.findOneAndUpdate(
      { mid: mid },
      { $set: { content: "This user has deleted this message" } },
      { new: true }
    );
    if (updatedMessage) {
      // Use the new function
      await handleMessageUpdate(
        updatedMessage.toObject(),
        conversation.erxesApiId,
        subdomain
      );
    }
  }
};

async function handleMessageUpdate(messageObject, conversationId, subdomain) {
  // Send message to inbox
  await sendInboxMessage({
    subdomain,
    action: "conversationClientMessageInserted",
    data: { ...messageObject, conversationId }
  });

  // Publish message to GraphQL
  graphqlPubsub.publish(`conversationMessageInserted:${conversationId}`, {
    conversationMessageInserted: { ...messageObject, conversationId }
  });
}

export default receiveMessage;
