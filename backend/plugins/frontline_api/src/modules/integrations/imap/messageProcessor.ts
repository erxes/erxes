import Imap from 'node-imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';


const MAX_FETCH_PER_SYNC = 50;

export const searchMessages = (
  imap: Imap,
  criteria: any,
): Promise<ParsedMail[]> => {
  return new Promise((resolve, reject) => {
    imap.search(criteria, (err, results) => {
      if (err) return reject(err);
      if (!results?.length) return resolve([]);

      const limited = results.slice(-MAX_FETCH_PER_SYNC);

      let fetcher: Imap.ImapFetch;
      try {
        fetcher = imap.fetch(limited, { bodies: '', struct: true });
      } catch (e: any) {
        if (e.message?.includes('Nothing to fetch')) return resolve([]);
        return reject(e);
      }

   
      const rawMessages: Buffer[] = [];

      fetcher.on('error', reject);

      fetcher.on('message', (msg) => {
        const chunks: Buffer[] = [];
        msg.on('body', (stream) => {
          stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          stream.once('end', () =>
            rawMessages.push(Buffer.concat(chunks as Uint8Array[])),
          );
        });
      });

      fetcher.once('end', async () => {
        const parsed: ParsedMail[] = [];
        for (const raw of rawMessages) {
          try {
            parsed.push(await simpleParser(raw));
          } catch (e) {
            console.error('[IMAP] Failed to parse message:', e);
          }
          raw.fill(0);
        }
        rawMessages.length = 0;
        resolve(parsed);
      });
    });
  });
};


export const findOrCreateCustomer = async (
  subdomain: string,
  email: string,
  integrationId: string,
  models: IModels,
): Promise<string> => {
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
      query: {
        customerPrimaryEmail: email,
      },
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
      doc: {
        integrationId,
        primaryEmail: email,
      },
    },
    defaultValue: {},
  });

  if (!apiCustomerResponse?._id) {
    throw new Error('Failed to create customer in Core');
  }

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
    { messageId: { $in: references ?? [] } },
  ];

  if (inReplyTo) {
    $or.push({ messageId: inReplyTo });
    $or.push({ references: { $in: [inReplyTo] } });
  }

  const related = await models.ImapMessages.findOne({ $or });
  return related?.inboxConversationId ?? null;
};
