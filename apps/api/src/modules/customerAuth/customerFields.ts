import { type DataExtensionValues, isEmptyValue } from '@erxes/core-contract';
import type { CustomerSignUpData, Db } from '@erxes/core-db';
import { fail } from '~/http/errors';
import { findCustomer } from '~/modules/customers/customerRows';
import { type DataFieldRow, fieldsOf } from '~/modules/dataExtensions/definitions';
import { allValues } from '~/modules/dataExtensions/hostValues.service';
import { prepareValues } from '~/modules/dataExtensions/values';

const CUSTOMER = 'core.customer';

type Values = DataExtensionValues;

/** Whether customers fill the field in themselves: theirs, shown, and not read-only. */
const isTheirs = (field: DataFieldRow) =>
  Boolean(field.settings.customerEditable) &&
  !field.settings.hidden &&
  !field.settings.readOnly &&
  !field.plugin;

/**
 * The customer fields the organisation lets customers fill in themselves (decision 42): active,
 * in order, each with whether sign-up needs it. Nothing else is theirs to read or write.
 */
export const customerFieldsOf = async (tx: Db) =>
  (await fieldsOf(tx, CUSTOMER))
    .filter(isTheirs)
    .map((field) => ({ ...field, required: Boolean(field.settings.required) }));

/** 400 INVALID_FIELD for a value of a field customers don't fill in. */
const assertTheirs = (fields: DataFieldRow[], values: Values) => {
  const theirs = new Set(fields.filter(isTheirs).map((field) => field.key));
  const other = Object.keys(values).find((key) => !theirs.has(key));

  if (other === undefined) return;

  const fieldId = fields.find((field) => field.key === other)?.id ?? other;

  throw fail('INVALID_FIELD', 'Customers can’t fill in this field', { fieldId });
};

/** Values of the fields customers fill in, the rest left out. */
const theirsOnly = (fields: DataFieldRow[], values: Values) =>
  Object.fromEntries(
    fields.filter(isTheirs).map((field) => [field.key, values[field.key] ?? null]),
  );

/** The customer as they see themselves: the values of their own fields only. */
export const profileOf = async (tx: Db, customerId: string) => {
  const customer = await findCustomer(tx, customerId);
  const fields = await fieldsOf(tx, CUSTOMER);

  return { ...customer, values: theirsOnly(fields, await allValues(tx, CUSTOMER, customerId)) };
};

/** A customer's own value changes: a field not theirs is refused, the rest checked on write. */
export const checkTheirValues = async (tx: Db, patch: Values) => {
  assertTheirs(await fieldsOf(tx, CUSTOMER), patch);
};

/**
 * A sign-up form, checked as it is sent: only fields customers fill in, each required one given,
 * every value by its field's rules.
 */
export const checkSignUp = async (
  tx: Db,
  form: CustomerSignUpData,
): Promise<CustomerSignUpData> => {
  const fields = await fieldsOf(tx, CUSTOMER);
  const given = form.values ?? {};

  assertTheirs(fields, given);

  const missing = fields.find(
    (field) => isTheirs(field) && field.settings.required && isEmptyValue(given[field.key]),
  );

  if (missing) {
    throw fail('INVALID_FIELD', `${missing.label} is required`, { fieldId: missing.id });
  }

  // Checked now, so a bad form gets no code; written (and checked again) when it is confirmed.
  // Their fields hold no relations, so no relation sides.
  await prepareValues(tx, fields, new Map(), given, false);

  return {
    firstName: form.firstName,
    lastName: form.lastName || null,
    birthDate: form.birthDate || null,
    values: given,
  };
};
