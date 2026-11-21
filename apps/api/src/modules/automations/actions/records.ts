import {
  CompanyFields,
  CustomerFields,
  DataExtensionFieldKey,
  DataExtensionValuesInput,
  Id,
} from '@erxes/core-contract';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { addNote } from '~/modules/activities/activities.service';
import { tagCompanies, updateCompany } from '~/modules/companies/companies.service';
import { tagCustomers, updateCustomer } from '~/modules/customers/customers.service';
import { fieldsOf } from '~/modules/dataExtensions/definitions';
import { checked, type CoreAction, list, needSubject, parseInput, text } from './context';

const CustomerChanges = CustomerFields.pick({
  firstName: true,
  lastName: true,
  state: true,
  ownerId: true,
  description: true,
});

const CompanyChanges = CompanyFields.pick({ primaryName: true, ownerId: true, description: true });

/** Types whose values a step's text input gives as text: numbers and yes or no. */
const NUMERIC: ReadonlySet<string> = new Set(['number', 'percent', 'rating']);

/** A step's value as its Data Extensions field takes it: `'42'` a number, `'true'` yes; `''` clears. */
const typedValue = (type: string | undefined, value: unknown) => {
  if (value === '' || value === undefined) return null;

  if (typeof value !== 'string') return value;

  if (type && NUMERIC.has(type) && Number.isFinite(Number(value))) return Number(value);

  return type === 'boolean' && (value === 'true' || value === 'false') ? value === 'true' : value;
};

const tagFields = [
  { key: 'add', label: 'Add tags', type: 'tags', required: false },
  { key: 'remove', label: 'Remove tags', type: 'tags', required: false },
] as const;

/** Actions that change the customer or company a run is about. */
export const RECORD_ACTIONS: CoreAction[] = [
  {
    type: 'core.customer.update',
    label: 'Update the customer',
    description: 'Set fields of the customer the event is about',
    subject: 'customer',
    fields: [
      { key: 'firstName', label: 'First name', type: 'text', required: false },
      { key: 'lastName', label: 'Last name', type: 'text', required: false },
      {
        key: 'state',
        label: 'State',
        type: 'select',
        required: false,
        options: [
          { value: 'lead', label: 'Lead' },
          { value: 'customer', label: 'Customer' },
        ],
      },
      { key: 'ownerId', label: 'Owner', type: 'members', required: false },
      { key: 'description', label: 'Description', type: 'longtext', required: false },
    ],
    run: async (ctx) => {
      const id = needSubject(ctx, 'customer');
      const changes = parseInput(ctx, CustomerChanges, ['ownerId']);
      const saved = await updateCustomer(ctx.tx, id, changes);

      return { id: saved.id, changed: Object.keys(changes) };
    },
  },
  {
    type: 'core.company.update',
    label: 'Update the company',
    description: 'Set fields of the company the event is about',
    subject: 'company',
    fields: [
      { key: 'primaryName', label: 'Name', type: 'text', required: false },
      { key: 'ownerId', label: 'Owner', type: 'members', required: false },
      { key: 'description', label: 'Description', type: 'longtext', required: false },
    ],
    run: async (ctx) => {
      const id = needSubject(ctx, 'company');
      const changes = parseInput(ctx, CompanyChanges, ['ownerId']);
      const saved = await updateCompany(ctx.tx, id, changes);

      return { id: saved.id, changed: Object.keys(changes) };
    },
  },
  {
    type: 'core.customer.tag',
    label: 'Tag the customer',
    description: 'Add or remove tags',
    subject: 'customer',
    fields: [...tagFields],
    run: async (ctx) => {
      const tags = { add: list(ctx.input.add), remove: list(ctx.input.remove) };

      await tagCustomers(ctx.tx, { ids: [needSubject(ctx, 'customer')], ...tags });

      return { added: tags.add, removed: tags.remove };
    },
  },
  {
    type: 'core.company.tag',
    label: 'Tag the company',
    description: 'Add or remove tags',
    subject: 'company',
    fields: [...tagFields],
    run: async (ctx) => {
      const tags = { add: list(ctx.input.add), remove: list(ctx.input.remove) };

      await tagCompanies(ctx.tx, { ids: [needSubject(ctx, 'company')], ...tags });

      return { added: tags.add, removed: tags.remove };
    },
  },
  {
    type: 'core.note.add',
    label: 'Add a note',
    description: "Write a note on the customer's or company's timeline",
    subject: 'any',
    fields: [{ key: 'body', label: 'Note', type: 'longtext', required: true }],
    run: async (ctx) => {
      if (!ctx.subject)
        throw fail(
          'NO_SUBJECT',
          "This step needs a customer or company: the trigger event isn't about one",
        );

      const note = await addNote(ctx.tx, {
        targetType: ctx.subject.type,
        targetId: ctx.subject.id,
        body: text(ctx.input.body) ?? '',
        mentions: [],
        fileIds: [],
      });

      return { noteId: note.id };
    },
  },
  {
    type: 'core.customer.set_field',
    label: 'Set a custom field',
    description: 'Write a value into one of the customer’s custom fields',
    subject: 'customer',
    fields: [
      { key: 'fieldId', label: 'Field', type: 'custom_field', required: true },
      {
        key: 'value',
        label: 'Value',
        type: 'text',
        required: false,
        sameTypeAs: 'fieldId',
        description: 'Leave empty to clear the field',
      },
    ],
    run: async (ctx) => {
      const id = needSubject(ctx, 'customer');
      const { fieldId } = parseInput(ctx, z.object({ fieldId: Id }));
      const value = ctx.input.value === '' ? null : (ctx.input.value ?? null);

      const { customFields } = checked(CustomerFields.pick({ customFields: true }), {
        customFields: { [fieldId]: value },
      });

      await updateCustomer(ctx.tx, id, { customFields });

      return { fieldId, value };
    },
  },
  ...(['customer', 'company'] as const).map((subject): CoreAction => ({
    type: `core.${subject}.set_data_value`,
    label: 'Set a data field',
    description: `Write a value into one of the ${subject}’s Data Extensions fields`,
    subject,
    fields: [
      { key: 'field', label: 'Field key', type: 'text', required: true },
      {
        key: 'value',
        label: 'Value',
        type: 'text',
        required: false,
        description: 'Leave empty to clear the field',
      },
    ],
    run: async (ctx) => {
      const id = needSubject(ctx, subject);
      const { field } = parseInput(ctx, z.object({ field: DataExtensionFieldKey }));
      const typeOf = (await fieldsOf(ctx.tx, `core.${subject}`)).find((one) => one.key === field);
      const value = typedValue(typeOf?.type, ctx.input.value);
      const values = checked(DataExtensionValuesInput, { [field]: value });

      await (subject === 'customer'
        ? updateCustomer(ctx.tx, id, { values })
        : updateCompany(ctx.tx, id, { values }));

      return { field, value };
    },
  })),
];
