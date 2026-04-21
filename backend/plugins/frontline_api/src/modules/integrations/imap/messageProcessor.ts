import Imap from 'node-imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

/* ── Email fetching ─────────────────────────────────────────────────── */

export const searchMessages = (
  imap: Imap,
  criteria: any,
): Promise<ParsedMail[]> => {
  return new Promise((resolve, reject) => {
    imap.search(criteria, (err, results) => {
      if (err) return reject(err);
      if (!results?.length) return resolve([]);

      let fetcher: Imap.ImapFetch;
      try {
        fetcher = imap.fetch(results, { bodies: '', struct: true });
      } catch (e: any) {
        if (e.message?.includes('Nothing to fetch')) return resolve([]);
        return reject(e);
      }

      const rawMessages: Buffer[] = [];

      fetcher.on('error', reject);

      fetcher.on('message', (msg) => {
        msg.on('body', (stream) => {
          const chunks: Buffer[] = [];
          stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          stream.once('end', () => rawMessages.push(Buffer.concat(chunks as Uint8Array[])));
        });
      });

      fetcher.once('end', async () => {
        try {
          const parsed = await Promise.all(
            rawMessages.map((raw) => simpleParser(raw)),
          );
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });
  });
};

/* ── Customer resolution ────────────────────────────────────────────── */

/**
 * Finds or creates a CRM customer for the given email address.
 * Accepts `models` directly to avoid an extra `generateModels` round-trip.
 */
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


/* ── Conversation threading ─────────────────────────────────────────── */

/**
 * Returns an existing conversation ID if this message belongs to a known
 * thread (matched via In-Reply-To / References headers), or `null` otherwise.
 */
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
