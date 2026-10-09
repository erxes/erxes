import { escapeRegExp, sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { MailSendError } from './transports/common';

const PAGE_SIZE = 100;
const recipientSearchSchema = z.object({
  searchValue: z.string().trim().max(320).optional(),
  cursor: z.string().regex(/^\d+$/).optional(),
});

export interface MailVerifiedContact {
  _id: string;
  firstName?: string;
  lastName?: string;
  primaryEmail?: string;
  emails?: string[];
  emailValidationStatus?: string;
}

export class UnverifiedMailRecipientError extends MailSendError {
  constructor() {
    super(
      'All recipient email addresses must be verified before sending',
      false,
    );
  }
}

export const readUnverifiedMailRecipients = async (
  subdomain: string,
  emails: string[],
): Promise<string[]> => {
  const recipients = [
    ...new Set(
      z
        .array(z.string().trim().email().max(320))
        .max(500)
        .parse(emails)
        .map((email) => email.toLowerCase()),
    ),
  ];
  if (!recipients.length) return [];

  const contacts: MailVerifiedContact[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'customers',
    action: 'findActiveCustomers',
    input: {
      query: {
        emailValidationStatus: { $in: ['valid', 'verified'] },
        $or: recipients.map((email) => ({
          primaryEmail: { $regex: `^${escapeRegExp(email)}$`, $options: 'i' },
        })),
      },
      fields: { primaryEmail: 1, emailValidationStatus: 1 },
    },
    throwOnError: true,
  });
  const verified = new Set(
    contacts
      .filter((contact) =>
        ['valid', 'verified'].includes(contact.emailValidationStatus ?? ''),
      )
      .map((contact) => contact.primaryEmail?.trim().toLowerCase()),
  );
  return recipients.filter((email) => !verified.has(email));
};

export const assertVerifiedMailRecipients = async (
  subdomain: string,
  recipients: { to: string[]; cc?: string[]; bcc?: string[] },
): Promise<void> => {
  const unverified = await readUnverifiedMailRecipients(subdomain, [
    ...recipients.to,
    ...(recipients.cc ?? []),
    ...(recipients.bcc ?? []),
  ]);
  if (unverified.length) {
    throw new UnverifiedMailRecipientError();
  }
};

export const readMailVerifiedContacts = async (
  subdomain: string,
  args: { searchValue?: string; cursor?: string },
) => {
  const { searchValue, cursor } = recipientSearchSchema.parse(args);
  const skip = Number(cursor ?? 0);
  if (!Number.isSafeInteger(skip)) {
    throw new TypeError('Invalid recipient cursor');
  }

  const search = searchValue
    ? {
        $and: searchValue.split(/\s+/).map((word) => ({
          $or: ['primaryEmail', 'emails', 'firstName', 'lastName'].map(
            (field) => ({
              [field]: { $regex: escapeRegExp(word), $options: 'i' },
            }),
          ),
        })),
      }
    : {};
  const contacts: MailVerifiedContact[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'customers',
    action: 'findActiveCustomers',
    input: {
      query: {
        emailValidationStatus: { $in: ['valid', 'verified'] },
        ...search,
      },
      fields: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        primaryEmail: 1,
        emails: 1,
        emailValidationStatus: 1,
      },
      skip,
      limit: PAGE_SIZE + 1,
    },
    throwOnError: true,
  });

  return {
    list: contacts.slice(0, PAGE_SIZE),
    pageInfo: {
      endCursor: String(skip + Math.min(contacts.length, PAGE_SIZE)),
      hasNextPage: contacts.length > PAGE_SIZE,
    },
  };
};
