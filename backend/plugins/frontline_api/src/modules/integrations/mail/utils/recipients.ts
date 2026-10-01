import { escapeRegExp, sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';

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

export const readMailVerifiedContacts = async (
  subdomain: string,
  args: { searchValue?: string; cursor?: string },
) => {
  const { searchValue, cursor } = recipientSearchSchema.parse(args);
  const skip = Number(cursor ?? 0);
  if (!Number.isSafeInteger(skip)) {
    throw new Error('Invalid recipient cursor');
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
