import type { CustomerInput } from '@erxes/core-contract';
import type { customers } from '@erxes/core-db';
import { normalizeEmail, normalizePhone, resolveContacts } from '~/lib/contacts';
import type { CustomerRow } from './customerRows';

/** The plain columns of an input (contacts, tags and custom fields are resolved separately). */
export const scalarFields = (input: CustomerInput) => {
  const {
    primaryEmail,
    emails,
    primaryPhone,
    phones,
    tagIds,
    customFields,
    leadStageId,
    disqualifyReason,
    source,
    sourceDetails,
    ...rest
  } = input;

  return rest;
};

/** The email and phone columns an update changes. */
export const contactColumns = (
  current: Pick<CustomerRow, 'primaryEmail' | 'emails' | 'primaryPhone' | 'phones'>,
  input: CustomerInput,
) => {
  const changes: Partial<typeof customers.$inferInsert> = {};

  if (input.primaryEmail !== undefined || input.emails !== undefined) {
    const email = resolveContacts(
      input.primaryEmail,
      input.emails,
      { primary: current.primaryEmail, list: current.emails },
      normalizeEmail,
    );

    changes.primaryEmail = email.primary;
    changes.emails = email.list;
  }

  if (input.primaryPhone !== undefined || input.phones !== undefined) {
    const phone = resolveContacts(
      input.primaryPhone,
      input.phones,
      { primary: current.primaryPhone, list: current.phones },
      normalizePhone,
    );

    changes.primaryPhone = phone.primary;
    changes.phones = phone.list;
  }

  return changes;
};
