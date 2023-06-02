import { sendContactsMessage, sendInboxMessage } from './messageBroker';
import { Customers, Messages } from './models';

const searchMessages = (linkedin, criteria) => {
  return new Promise((resolve, reject) => {
    const messages: any = [];
  });
};

// Example for save messages to inbox and create or update customer
const saveMessages = async (linkedin, integration, criteria) => {
  const msgs: any = await searchMessages(linkedin, criteria);

  for (const msg of msgs) {
    const message = await Messages.findOne({
      messageId: msg.messageId
    });

    if (message) {
      continue;
    }

    const from = msg.from.value[0].address;
    const prev = await Customers.findOne({ email: from });

    let customerId;

    if (!prev) {
      const customer = await sendContactsMessage({
        subdomain: 'os',
        action: 'customers.findOne',
        data: {
          primaryEmail: from
        },
        isRPC: true
      });

      if (customer) {
        customerId = customer._id;
      } else {
        const apiCustomerResponse = await sendContactsMessage({
          subdomain: 'os',
          action: 'customers.createCustomer',
          data: {
            integrationId: integration.inboxId,
            primaryEmail: from
          },
          isRPC: true
        });

        customerId = apiCustomerResponse._id;
      }

      await Customers.create({
        inboxIntegrationId: integration.inboxId,
        contactsId: customerId,
        email: from
      });
    } else {
      customerId = prev.contactsId;
    }

    let conversationId;

    const relatedMessage = await Messages.findOne({
      $or: [
        { messageId: msg.inReplyTo },
        { messageId: { $in: msg.references || [] } },
        { references: { $in: [msg.messageId] } },
        { references: { $in: [msg.inReplyTo] } }
      ]
    });

    if (relatedMessage) {
      conversationId = relatedMessage.inboxConversationId;
    } else {
      const { _id } = await sendInboxMessage({
        subdomain: 'os',
        action: 'integrations.receive',
        data: {
          action: 'create-or-update-conversation',
          payload: JSON.stringify({
            integrationId: integration.inboxId,
            customerId,
            createdAt: msg.date,
            content: msg.subject
          })
        },
        isRPC: true
      });

      conversationId = _id;
    }

    await Messages.create({
      inboxIntegrationId: integration.inboxId,
      inboxConversationId: conversationId,
      createdAt: msg.date,
      messageId: msg.messageId,
      inReplyTo: msg.inReplyTo,
      references: msg.references,
      subject: msg.subject,
      body: msg.html,
      to: msg.to && msg.to.value,
      cc: msg.cc && msg.cc.value,
      bcc: msg.bcc && msg.bcc.value,
      from: msg.from && msg.from.value
    });
  }
};

// controller for discord
const init = async app => {
  app.get('/login', async (req, res) => {
    res.send('login');
  });

  app.post('/receive', async (req, res, next) => {
    try {
      // write receive code here

      res.send('Successfully receiving message');
    } catch (e) {
      return next(new Error(e));
    }

    res.sendStatus(200);
  });
};

export default init;
