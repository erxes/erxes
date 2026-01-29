import Imap from 'node-imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { IModels, generateModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const searchMessages = async (
  imap: Imap,
  criteria: any,
): Promise<ParsedMail[]> => {
  return new Promise((resolve, reject) => {
    const messages: Uint8Array[] = [];

    imap.search(criteria, (err, results) => {
      if (err) {
        return reject(err);
      }

      if (!results || results.length === 0) {
        return resolve([]);
      }

      let fetcher: Imap.ImapFetch;

      try {
        fetcher = imap.fetch(results, {
          bodies: '',
          struct: true,
        });
      } catch (e: any) {
        if (e.message?.includes('Nothing to fetch')) {
          return resolve([]);
        }
        return reject(e);
      }

      fetcher.on('error', (error) => {
        reject(error);
      });

      fetcher.on('message', (msg) => {
        msg.on('body', (stream) => {
          const buffers: Uint8Array[] = [];

          stream.on('data', (chunk: Buffer) => {
            buffers.push(chunk as Uint8Array);
          });

          stream.once('end', () => {
            messages.push(Buffer.concat(buffers) as unknown as Uint8Array);
          });
        });
      });

      fetcher.once('end', async () => {
        try {
          const parsedMessages: ParsedMail[] = [];

          for (const message of messages) {
            const parsed = await simpleParser(message);
            parsedMessages.push(parsed);
          }

          resolve(parsedMessages);
        } catch (e) {
          reject(e);
        }
      });
    });
  });
};

export const findOrCreateCustomer = async (
  subdomain: string,
  email: string,
  integrationId: string,
): Promise<string> => {
  const models = await generateModels(subdomain);

  const prev = await models.ImapCustomers.findOne({ email });
  if (prev) {
    return prev.contactsId;
  }

  const customer = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'customers',
    action: 'findOne',
    input: {
      customerPrimaryEmail: email,
    },
    defaultValue: null,
  });

  if (customer?._id) {
    await models.ImapCustomers.create({
      inboxIntegrationId: integrationId,
      contactsId: customer._id,
      email,
    });
    return customer._id;
  }

  const apiCustomerResponse = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'customers',
    action: 'createCustomer',
    input: {
      integrationId,
      primaryEmail: email,
    },
    defaultValue: {},
  });

  await models.ImapCustomers.create({
    inboxIntegrationId: integrationId,
    contactsId: apiCustomerResponse._id,
    email,
  });

  return apiCustomerResponse._id;
};

export const findRelatedConversation = async (
  models: IModels,
  messageId: string,
  inReplyTo?: string,
  references?: string[],
): Promise<string | null> => {
  const $or: any[] = [
    { references: { $in: [messageId] } },
    { messageId: { $in: references || [] } },
  ];

  if (inReplyTo) {
    $or.push({ messageId: inReplyTo });
    $or.push({ references: { $in: [inReplyTo] } });
  }

  const relatedMessage = await models.ImapMessages.findOne({ $or });
  return relatedMessage?.inboxConversationId || null;
};
