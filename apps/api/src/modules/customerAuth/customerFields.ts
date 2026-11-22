import type { CustomValue, CustomerSignUpData, Db } from '@erxes/core-db';
import { fieldGroups, fields } from '@erxes/core-db';
import { and, asc, eq, getTableColumns, isNull } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { findCustomer } from '~/modules/customers/customerRows';
import { applyCustomFields, isEmpty } from '~/modules/fields/customValues';

/**
 * The customer fields the organisation lets customers fill in themselves (decision 42): live,
 * in a live group, in order. Nothing else is theirs to read or write.
 */
export const customerFieldsOf = (tx: Db) =>
  tx
    .select(getTableColumns(fields))
    .from(fields)
    .leftJoin(fieldGroups, eq(fieldGroups.id, fields.groupId))
    .where(
      and(
        eq(fields.contentType, 'customer'),
        eq(fields.customerEditable, true),
        isNull(fields.archivedAt),
        isNull(fieldGroups.archivedAt),
      ),
    )
    .orderBy(asc(fields.order), asc(fields.id));

const idsOf = async (tx: Db) => new Set((await customerFieldsOf(tx)).map((field) => field.id));

/** 400 INVALID_FIELD for a field customers don't fill in. */
const assertTheirs = (values: Record<string, unknown>, theirs: Set<string>) => {
  const other = Object.keys(values).find((id) => !theirs.has(id));

  if (other) throw fail('INVALID_FIELD', 'Customers can’t fill in this field', { fieldId: other });
};

/** Values of the fields customers fill in, the rest left out. */
const theirsOnly = (values: Record<string, CustomValue>, theirs: Set<string>) =>
  Object.fromEntries(Object.entries(values).filter(([id]) => theirs.has(id)));

/** The customer as they see themselves: their custom fields only. */
export const profileOf = async (tx: Db, customerId: string) => {
  const customer = await findCustomer(tx, customerId);

  return { ...customer, customFields: theirsOnly(customer.customFields, await idsOf(tx)) };
};

/** A customer's own field changes, checked by the fields' rules; a field not theirs is refused. */
export const checkTheirFields = async (
  tx: Db,
  current: Record<string, CustomValue>,
  patch: Record<string, CustomValue | null>,
) => {
  assertTheirs(patch, await idsOf(tx));

  return applyCustomFields(tx, 'customer', current, patch);
};

/**
 * A sign-up form, checked as it is sent: only fields customers fill in, each required one given,
 * every value by its field's rules.
 */
export const checkSignUp = async (
  tx: Db,
  form: CustomerSignUpData,
): Promise<CustomerSignUpData> => {
  const theirs = await customerFieldsOf(tx);
  const given = form.customFields ?? {};

  assertTheirs(given, new Set(theirs.map((field) => field.id)));

  const missing = theirs.find((field) => {
    const value = given[field.id];

    return field.isRequired && (value === undefined || isEmpty(value));
  });

  if (missing) {
    throw fail('INVALID_FIELD', `${missing.label} is required`, { fieldId: missing.id });
  }

  return {
    firstName: form.firstName,
    lastName: form.lastName || null,
    birthDate: form.birthDate || null,
    customFields: await applyCustomFields(tx, 'customer', {}, given),
  };
};
