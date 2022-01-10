
import {
  Context,
} from "graphql-ws";
import { Extra } from "graphql-ws/lib/use/ws";
import { WebSocket } from "ws";
import pubsub from './pubsub';
import redis from '../redis';
import { Customers, ConversationMessages, Conversations } from '../db'

export async function markClientActive(
  ctx: Context<Extra & Partial<Record<PropertyKey, never>>>
) {
  const messengerDataJson: string = ctx.connectionParams
    ?.messengerDataJson as string;
  const socket: WebSocket & { messengerData?: any } = ctx.extra.socket;

  // try to renew messengerData
  if (messengerDataJson) {
    const messengerData = JSON.parse(messengerDataJson);
    if (!messengerData) return;
    socket.messengerData = messengerData;
  }

  // no messengerData
  if (!socket.messengerData) return;

  const customerId = socket.messengerData.customerId;
  const visitorId = socket.messengerData.visitorId;

  const memoryStorageValue = customerId || visitorId;

  const inConnectedClients = await redis.sismember(
    "connectedClients",
    memoryStorageValue
  );

  const inClients = await redis.sismember("clients", memoryStorageValue);

  if (!inConnectedClients) {
    await redis.sadd("connectedClients", memoryStorageValue);
  }

  // Waited for 1 minute to reconnect in onClose event and onClose event
  // removed this customer from connected clients list. So it means this customer
  // is back online
  if (!inClients) {
    await redis.sadd("clients", memoryStorageValue);

    if (customerId) {
      // mark as online
      await Customers.updateOne(
        { _id: customerId },
        { $set: { isOnline: true } }
      );
    }
    // notify as connected
    pubsub.publish("customerConnectionChanged", {
      customerConnectionChanged: {
        _id: customerId,
        status: "connected",
      },
    });
  }
}

export async function markClientInactive(
  ctx: Context<Extra & Partial<Record<PropertyKey, never>>>
) {
  const socket: WebSocket & { messengerData?: any } = ctx.extra.socket;
  const messengerData = socket.messengerData;

  if (!messengerData) return;

  const { customerId, visitorId } = messengerData;

  const memoryStorageValue = customerId || visitorId;

  const integrationId = messengerData.integrationId;

  await redis.srem("connectedClients", memoryStorageValue);

  setTimeout(async () => {
    // get status from inmemory storage
    const inNewConnectedClients = await redis.sismember(
      "connectedClients",
      memoryStorageValue
    );

    if (inNewConnectedClients) {
      return;
    }

    const customerLastStatus = await redis.get(
      `customer_last_status_${customerId}`
    );

    await redis.srem("clients", memoryStorageValue);

    if (customerId) {
      // mark as offline
      await Customers.updateOne(
        { _id: customerId },
        { $set: { isOnline: false } }
      );
    }

    // notify as disconnected
    pubsub.publish("customerConnectionChanged", {
      customerConnectionChanged: {
        _id: customerId,
        status: "disconnected",
      },
    });

    if (customerLastStatus === "left") return;

    redis.set(`customer_last_status_${customerId}`, "left");

    // customer has left + time

    const customerConversations = await Conversations.find({
      customerId,
      integrationId,
      status: "open",
    }).toArray();

    const messagesToInsert = customerConversations.map((conversation) => ({
      // _id: Random.id(),
      internal: false,
      conversationId: conversation._id,
      content: `Customer has left`,
      fromBot: true,
      createdAt: new Date(),
    }));

    const insertResult = await ConversationMessages.insertMany(
      messagesToInsert,
      { ordered: false }
    );

    const conversationMessages = await ConversationMessages.find({
      _id: { $in: insertResult.insertedIds },
    }).toArray();

    for (const message of conversationMessages) {
      pubsub.publish("conversationMessageInserted", {
        conversationMessageInserted: message,
      });

      pubsub.publish("conversationClientTypingStatusChanged", {
        conversationClientTypingStatusChanged: {
          conversationId: message.conversationId,
          text: "",
        },
      });
    }
  }, 60000);
}