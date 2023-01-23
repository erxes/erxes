import * as Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { generateModels } from './connectionResolver';
import { sendContactsMessage, sendInboxMessage } from './messageBroker';
import { IIntegrationDocument } from './models';

export const toUpper = thing => {
  return thing && thing.toUpperCase ? thing.toUpperCase() : thing;
};

export const findAttachmentParts = (struct, attachments?) => {
  attachments = attachments || [];

  for (var i = 0, len = struct.length, r; i < len; ++i) {
    if (Array.isArray(struct[i])) {
      findAttachmentParts(struct[i], attachments);
    } else {
      if (
        struct[i].disposition &&
        ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) >
          -1
      ) {
        attachments.push(struct[i]);
      }
    }
  }
  return attachments;
};

export const generateImap = (integration: IIntegrationDocument) => {
  return new Imap({
    user: integration.mainUser || integration.user,
    password: integration.password,
    host: integration.host,
    keepalive: { forceNoop: true },
    port: 993,
    tls: true
  });
};

const searchMessages = (imap, criteria) => {
  return new Promise((resolve, reject) => {
    let messages: any = [];

    imap.search(criteria, function(err, results) {
      if (err) throw err;

      let f;

      try {
        f = imap.fetch(results, { bodies: '', struct: true });
      } catch (e) {
        if (e.message.includes('Nothing to fetch')) {
          return resolve([]);
        }

        throw e;
      }

      f.on('message', function(msg) {
        msg.on('body', async function(stream) {
          var buffer = '';

          stream.on('data', function(chunk) {
            buffer += chunk.toString('utf8');
          });

          stream.once('end', async () => {
            messages.push(buffer);
          });
        });
      });

      f.once('error', function(err) {
        reject(err);
      });

      f.once('end', async function() {
        const results: any = [];

        for (const buffer of messages) {
          const parsed = await simpleParser(buffer);
          results.push(parsed);
        }

        resolve(results);
      });
    });
  });
};

const saveMessages = async (
  subdomain: string,
  imap,
  integration: IIntegrationDocument,
  criteria
) => {
  const models = await generateModels(subdomain);

  const msgs: any = await searchMessages(imap, criteria);

  for (const msg of msgs) {
    if (
      msg.to &&
      msg.to.value &&
      msg.to.value[0] &&
      msg.to.value[0].address !== integration.user
    ) {
      continue;
    }

    const message = await models.Messages.findOne({
      messageId: msg.messageId
    });

    if (message) {
      continue;
    }

    const from = msg.from.value[0].address;
    const prev = await models.Customers.findOne({ email: from });

    let customerId;

    if (!prev) {
      const customer = await sendContactsMessage({
        subdomain,
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
          subdomain,
          action: 'customers.createCustomer',
          data: {
            integrationId: integration.inboxId,
            primaryEmail: from
          },
          isRPC: true
        });

        customerId = apiCustomerResponse._id;
      }

      await models.Customers.create({
        inboxIntegrationId: integration.inboxId,
        contactsId: customerId,
        email: from
      });
    } else {
      customerId = prev.contactsId;
    }

    let conversationId;

    const relatedMessage = await models.Messages.findOne({
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
        subdomain,
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

    await models.Messages.create({
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
      from: msg.from && msg.from.value,
      attachments: msg.attachments
    });
  }
};

export const listenIntegration = async (
  subdomain: string,
  integration: IIntegrationDocument
) => {
  const models = await generateModels(subdomain);

  var imap = generateImap(integration);

  imap.once('ready', response => {
    imap.openBox('INBOX', true, async (err, box) => {
      try {
        await saveMessages(subdomain, imap, integration, ['UNSEEN']);
      } catch (e) {
        await models.Logs.createLog({
          type: 'error',
          message: e.message,
          errorStack: e.stack
        });

        throw e;
      }
    });
  });

  imap.on('mail', async response => {
    console.log('new messages ========', response);

    const models = await generateModels(subdomain);

    const updatedIntegration = await models.Integrations.findOne({
      _id: integration._id
    });

    if (!updatedIntegration) {
      console.log(`ending ${integration.user} imap`);
      return imap.end();
    }

    try {
      await saveMessages(subdomain, imap, integration, ['UNSEEN']);
    } catch (e) {
      await models.Logs.createLog({
        type: 'error',
        message: e.message,
        errorStack: e.stack
      });

      throw e;
    }
  });

  imap.once('error', async e => {
    await models.Logs.createLog({
      type: 'error',
      message: e.message,
      errorStack: e.stack
    });

    console.log('on imap.once =============', e);
  });

  imap.once('end', function(e) {
    console.log('Connection ended', e);
  });

  imap.connect();
};

const listen = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  await models.Logs.createLog({
    type: 'info',
    message: `Started syncing integrations`
  });

  const integrations = await models.Integrations.find();

  for (const integration of integrations) {
    await listenIntegration(subdomain, integration);
  }
};

export default listen;
