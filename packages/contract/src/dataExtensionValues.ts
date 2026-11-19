import { z } from 'zod';
import { EmailAddress, httpUrl, Id, PhoneNumber } from './common';
import { DataExtensionFieldKey, type DataExtensionField } from './dataExtensionFields';

/** Longest text a text field takes, and a long text field. */
const TEXT_MAX = 2000;
const LONG_TEXT_MAX = 20_000;

/** Items in a list value: emails, phones, links, files. */
const LIST_ITEMS = 20;

/** Choices in a multi-select, members in a multiple member field. */
const MANY_MAX = 50;

/** Largest JSON value, serialized, and how deep it nests. */
const JSON_BYTES = 10_000;
const JSON_DEPTH = 6;

const Part = z.string().trim().max(200).nullable();

export const DataExtensionCurrency = z.object({
  amount: z.number(),
  currency: z.string().regex(/^[A-Z]{3}$/, 'an ISO 4217 code'),
});

export const DataExtensionFullName = z.object({ firstName: Part, lastName: Part });

export const DataExtensionAddress = z.object({
  street: Part,
  street2: Part,
  city: Part,
  state: Part,
  postalCode: Part,
  country: Part,
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
});

export const DataExtensionLink = z.object({
  url: httpUrl(TEXT_MAX),
  label: z.string().trim().max(200).nullable(),
});

/** One primary value and the rest, as Twenty keeps emails, phones and links. */
const primaryAndMore = <T extends z.ZodType>(item: T) =>
  z.object({ primary: item.nullable(), additional: z.array(item).max(LIST_ITEMS) });

export const DataExtensionEmails = primaryAndMore(EmailAddress);
export const DataExtensionPhones = primaryAndMore(PhoneNumber);
export const DataExtensionLinks = primaryAndMore(DataExtensionLink);

/** A file of core's files (`files.upload`), with what lists show without fetching it. */
export const DataExtensionFile = z.object({
  id: Id,
  name: z.string().trim().min(1).max(255),
  type: z.string().max(100).nullable(),
  size: z.int().min(0).nullable(),
});

const depthOf = (value: unknown): number =>
  value !== null && typeof value === 'object'
    ? 1 + Math.max(0, ...Object.values(value).map(depthOf))
    : 0;

const JsonValue = z
  .json()
  .refine((value) => JSON.stringify(value).length <= JSON_BYTES, `at most ${JSON_BYTES} characters`)
  .refine((value) => depthOf(value) <= JSON_DEPTH, `at most ${JSON_DEPTH} levels deep`);

/** The fields of a field that decide what its value may be. */
export type DataExtensionValueRules = Pick<
  DataExtensionField,
  'type' | 'options' | 'relation' | 'settings'
>;

const bounded = (rules: DataExtensionValueRules, number: z.ZodNumber) => {
  const { min, max } = rules.settings;
  const low = min === undefined ? number : number.min(min);

  return max === undefined ? low : low.max(max);
};

const text = (rules: DataExtensionValueRules, limit: number) =>
  z
    .string()
    .trim()
    .max(Math.min(rules.settings.maxLength ?? limit, limit));

/** Whether a relation field holds many ids: the "one" side of a pair, or many-to-many. */
export const holdsMany = ({ kind, side }: NonNullable<DataExtensionField['relation']>) =>
  kind === 'manyToMany' ||
  (kind === 'oneToMany' && side === 'source') ||
  (kind === 'manyToOne' && side === 'inverse');

/** Most records one relation value links. */
const LINKS_MAX = 100;

const relationValue = (rules: DataExtensionValueRules) =>
  rules.relation && holdsMany(rules.relation) ? z.array(Id).max(LINKS_MAX) : Id;

const choice = (rules: DataExtensionValueRules) => {
  const [first, ...rest] = rules.options.map((option) => option.value);

  return first === undefined ? z.never() : z.enum([first, ...rest]);
};

/** What a value of the field's type may be, before `null` (cleared) is allowed. */
const typedValue = (rules: DataExtensionValueRules): z.ZodType => {
  switch (rules.type) {
    case 'text':
      return text(rules, TEXT_MAX);
    case 'longText':
      return text(rules, LONG_TEXT_MAX);
    case 'number':
    case 'percent':
      return bounded(rules, z.number());
    case 'currency':
      return DataExtensionCurrency.extend({ amount: bounded(rules, z.number()) });
    case 'rating':
      return z
        .int()
        .min(1)
        .max(rules.settings.scale ?? 5);
    case 'boolean':
      return z.boolean();
    case 'date':
      return z.iso.date();
    case 'dateTime':
      return z.iso.datetime({ offset: true });
    case 'select':
      return choice(rules);
    case 'multiSelect':
      return z.array(choice(rules)).max(MANY_MAX);
    case 'email':
      return EmailAddress;
    case 'phone':
      return PhoneNumber;
    case 'url':
      return httpUrl(TEXT_MAX);
    case 'emails':
      return DataExtensionEmails;
    case 'phones':
      return DataExtensionPhones;
    case 'links':
      return DataExtensionLinks;
    case 'fullName':
      return DataExtensionFullName;
    case 'address':
      return DataExtensionAddress;
    case 'member':
      return rules.settings.multiple ? z.array(Id).max(MANY_MAX) : Id;
    case 'files':
      return z.array(DataExtensionFile).max(LIST_ITEMS);
    case 'relation':
      return relationValue(rules);
    case 'json':
      return JsonValue;
    // Given by the API (the next number) or computed as records are read: never written.
    case 'autoNumber':
    case 'formula':
    case 'rollup':
      return z.never();
  }
};

/**
 * What a field's value may be: its type's value within its settings, or `null` to clear it.
 * The API checks every write with it; web's forms check with the same schema.
 */
export const dataExtensionValueSchema = (rules: DataExtensionValueRules) =>
  typedValue(rules).nullable();

/** Values by field key, as a write sends them: each one checked against its field's schema. */
export const DataExtensionValuesInput = z.record(DataExtensionFieldKey, z.json().nullable());

/** Values by field key, as the API answers: what each field holds, or `null`. */
export const DataExtensionValues = z.record(z.string(), z.json().nullable());

export type DataExtensionValues = z.infer<typeof DataExtensionValues>;
