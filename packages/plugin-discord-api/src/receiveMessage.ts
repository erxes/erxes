import { Message } from 'discord.js';
import { Converter } from 'showdown';
import {
  Accounts,
  Customers,
  Integrations,
  Messages,
  integrationSchema
} from './models';
import { sendInboxMessage } from './messageBroker';

const converter = new Converter();

const getOrCreateCustomer = async (message, integration) => {
  const from = message.author.id;

  let customer = await Customers.findOne({ discordId: from });

  if (customer && customer.contactsId) {
    return customer;
  }

  if (!customer) {
    try {
      customer = await Customers.create({
        discordId: from,
        inboxIntegrationId: integration.inboxId
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: customer duplication'
          : e
      );
    }
  }

  try {
    const apiCustomerResponse = await sendInboxMessage({
      subdomain: 'os',
      action: 'integrations.receive',
      data: {
        action: 'get-create-update-customer',
        payload: JSON.stringify({
          integrationId: integration.inboxId,
          firstName: `${message.author.username}`,
          lastName: `#${message.author.discriminator}`,
          discordId: from,
          isUser: true
        })
      },
      isRPC: true
    });

    customer.contactsId = apiCustomerResponse._id;
    const saveResult = await customer.save();

    return saveResult;
  } catch (e) {
    await Customers.deleteOne({ _id: customer._id });
  }

  return customer;
};

export const receiveMessage = async (message: Message) => {
  // Don't save bot messages
  if (message.author.bot) return;
  const account = await Accounts.getAccount({
    guildId: message.guildId
  });

  const integration = await Integrations.getIntegration({
    $and: [
      { discordChannelIds: { $in: [message.channelId] } },
      { accountId: account._id }
    ]
  });

  const customer = await getOrCreateCustomer(message, integration);
  const customerId = customer.contactsId;

  let conversationId;

  const formattedAttachments = (message.attachments || []).map(msg => ({
    name: msg.name,
    type: msg.contentType,
    url: msg.url,
    size: msg.size,
    duration: msg.duration
  }));

  const relatedMessage = await Messages.findOne({
    $or: [
      { messageId: message.reference?.messageId },
      { 'to.address': message.author.id },
      { references: { $in: [message.reference?.messageId] } }
    ]
  });

  if (relatedMessage) {
    conversationId = relatedMessage.inboxConversationId;
  } else {
    const conversationFound = await sendInboxMessage({
      subdomain: 'os',
      action: 'integrations.receive',
      data: {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          integrationId: integration.inboxId,
          customerId,
          createdAt: message.createdAt,
          content: message.content ? converter.makeHtml(message.content) : '',
          attachments: formattedAttachments
        })
      },
      isRPC: true
    });

    conversationId = conversationFound._id;
  }

  const conversationMessage = await sendInboxMessage({
    subdomain: 'os',
    action: 'integrations.receive',
    data: {
      action: 'create-conversation-message',
      payload: JSON.stringify({
        integrationId: integration.inboxId,
        conversationId,
        createdAt: message.createdTimestamp,
        content: `${converter.makeHtml(
          message.content
        )} ${formattedAttachments.map(a => a.url).join(' ')}`
      })
    }
  });

  const newMessage = {
    inboxIntegrationId: integration.inboxId,
    inboxConversationId: conversationId,
    createdAt: message.createdTimestamp,
    messageId: message.id,
    channelId: message.channelId,
    inReplyTo: message.reference?.messageId || '',
    subject: converter.makeHtml(message.content),
    body: converter.makeHtml(message.content),
    to: message.mentions?.users.map(u => ({
      name: `${u.username}`,
      address: u.id
    })),
    from: [{ name: `${message.author.username}`, address: message.author.id }]
  };
  await Messages.create(newMessage);
};
