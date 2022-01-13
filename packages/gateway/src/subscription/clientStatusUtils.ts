import { Context } from "graphql-ws";
import { Extra } from "graphql-ws/lib/use/ws";
import { WebSocket } from "ws";
import pubsub from "./pubsub";
import redis from "../redis";
import { Customers, ConversationMessages, Conversations } from "../db";

export async function markClientActive(
  ctx: Context<Extra & Partial<Record<PropertyKey, never>>>
) {
  const messengerDataJson: string | null | undefined = ctx.connectionParams
    ?.messengerDataJson as (string | null | undefined);
  const socket: WebSocket & { messengerData?: any } = ctx.extra.socket;

  /*
    Clear previous one. It could be from previous different client. 
    Also the client always sends messengerDataJson onSubscription
  */
  socket.messengerData = undefined;

  if (!messengerDataJson) return;

  try {
    socket.messengerData = JSON.parse(messengerDataJson);
  } catch (e) {
    console.error("JSON.parse(messengerDataJson)", e);
  }

  // no messengerData
  if (!socket.messengerData) return;

  const customerId = socket.messengerData.customerId;
  const visitorId = socket.messengerData.visitorId;

  const memoryStorageValue = customerId || visitorId;

  redis.sadd("connectedClients", memoryStorageValue);

  const inClients = await redis.sismember("clients", memoryStorageValue);

  // Waited for 1 minute to reconnect in onClose event and onClose event
  // removed this customer from connected clients list. So it means this customer
  // is back online
  if (!inClients) {
    redis.sadd("clients", memoryStorageValue);

    if (customerId) {
      // mark as online

      await Customers.updateOne(
        { _id: customerId },
        { $set: { isOnline: true } }
      );

      // notify as connected
      pubsub.publish("customerConnectionChanged", {
        customerConnectionChanged: {
          _id: customerId,
          status: "connected",
        },
      });
    }
  }
}

export async function markClientInactive(
  ctx: Context<Extra & Partial<Record<PropertyKey, never>>>
) {
  const socket: WebSocket & { messengerData?: any } = ctx.extra.socket;
  if (!socket.messengerData) return;

  const messengerData = socket.messengerData;

  /* 
    This socket might be reused to handle other clients.
    So, we delete old clients data, just in case.
  */
  socket.messengerData = undefined;

  const { customerId, visitorId, integrationId } = messengerData;

  const memoryStorageValue = customerId || visitorId;

  await redis.srem("connectedClients", memoryStorageValue);

  setTimeout(async () => {
    // get status from inmemory storage
    const inNewConnectedClients = await redis.sismember(
      "connectedClients",
      memoryStorageValue
    );

    // client reconnected again, before this setTimeout finished
    if (inNewConnectedClients) {
      return;
    }

    redis.srem("clients", memoryStorageValue);

    if (!customerId) {
      return;
    }

    // mark as offline
    Customers.updateOne({ _id: customerId }, { $set: { isOnline: false } });

    // notify as disconnected
    pubsub.publish("customerConnectionChanged", {
      customerConnectionChanged: {
        _id: customerId,
        status: "disconnected",
      },
    });

    const customerLastStatus = await redis.get(
      `customer_last_status_${customerId}`
    );

    if (customerLastStatus === "left") return;

    redis.set(`customer_last_status_${customerId}`, "left");

    const customerConversations = await Conversations.find({
      customerId,
      integrationId,
      status: "open",
    }).toArray();

    if (!customerConversations?.length) {
      return;
    }

    const now = new Date();

    const messagesToInsert = customerConversations.map((conversation) => ({
      // _id: Random.id(),
      internal: false,
      conversationId: conversation._id,
      content: `Customer has left`,
      fromBot: true,
      createdAt: now,
    }));

    const insertResult = await ConversationMessages.insertMany(
      messagesToInsert,
      { ordered: false }
    );

    const conversationMessages = await ConversationMessages.find({
      _id: { $in: Object.values(insertResult.insertedIds) },
    }).toArray();

    for (const message of conversationMessages) {
      pubsub.publish("conversationMessageInserted", {
        conversationMessageInserted: message,
      });
    }

    for (const customerConversation of customerConversations) {
      pubsub.publish("conversationClientTypingStatusChanged", {
        conversationClientTypingStatusChanged: {
          conversationId: customerConversation._id,
          text: "",
        },
      });
    }
  }, 60000);
}
