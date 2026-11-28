import { CUSTOMER_MERGE_FIELDS, CUSTOMER_STATES } from '@erxes/core-db/enums';
import { companies, customers } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { ContactLink, ContactLinkInput } from './contactLinks';
import { CompanyId, CustomerId } from './records';
import {
  DataExtensionValues,
  DataExtensionValuesInput,
  DataSortQuery,
} from './dataExtensionValues';
import { ContactState, CustomerSex } from './values';
import {
  CursorQuery,
  CustomFields,
  CustomFieldsPatch,
  DESCRIPTION_MAX,
  EmailAddress,
  Id,
  IdList,
  PhoneNumber,
  cursorPageOf,
  ImageAddress,
  isoDate,
  listOf,
  MERGE_IDS_MESSAGE,
  MergeIds,
  namesMerged,
} from './common';
import { LIFECYCLE_COLUMNS, LIFECYCLE_INPUT_COLUMNS, lifecycleInput, lifecycleRow } from './leads';

/** `lead`: not a customer yet (e.g. a form submission). */
export const CustomerState = ContactState;

export type CustomerState = z.infer<typeof CustomerState>;

/** A person the organisation works with; shared by every plugin. */
export const Customer = createSelectSchema(customers, {
  id: CustomerId,
  sex: () => CustomerSex,
  createdAt: isoDate,
  updatedAt: isoDate,
  ...lifecycleRow,
})
  .pick({
    id: true,
    firstName: true,
    middleName: true,
    lastName: true,
    avatarUrl: true,
    primaryEmail: true,
    /** Every email address, the primary one first. */
    emails: true,
    primaryPhone: true,
    /** Every phone number, the primary one first. */
    phones: true,
    sex: true,
    /** `YYYY-MM-DD` */
    birthDate: true,
    position: true,
    department: true,
    code: true,
    description: true,
    /** Team member responsible for the customer. */
    ownerId: true,
    ...LIFECYCLE_COLUMNS,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    tagIds: z.array(z.string()),
    /** Custom field values by field id. */
    customFields: CustomFields,
  });

export type Customer = z.infer<typeof Customer>;

/** A customer as its get, list, create and update answer: with the Data Extensions values the caller may read. */
export const CustomerWithValues = Customer.extend({ values: DataExtensionValues });

export type CustomerWithValues = z.infer<typeof CustomerWithValues>;

export const CustomerFields = createUpdateSchema(customers, {
  firstName: (name) => name.trim().max(100),
  middleName: (name) => name.trim().max(100),
  lastName: (name) => name.trim().max(100),
  avatarUrl: () => ImageAddress,
  primaryEmail: () => EmailAddress,
  emails: () => z.array(EmailAddress).max(20),
  primaryPhone: () => PhoneNumber,
  phones: () => z.array(PhoneNumber).max(20),
  sex: () => CustomerSex,
  birthDate: (date) => date.regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  position: (value) => value.trim().max(200),
  department: (value) => value.trim().max(200),
  code: (code) => code.trim().max(100),
  description: (value) => value.trim().max(DESCRIPTION_MAX),
  ownerId: () => Id,
  ...lifecycleInput,
})
  .pick({
    firstName: true,
    middleName: true,
    lastName: true,
    avatarUrl: true,
    primaryEmail: true,
    emails: true,
    primaryPhone: true,
    phones: true,
    sex: true,
    birthDate: true,
    position: true,
    department: true,
    code: true,
    description: true,
    ownerId: true,
    ...LIFECYCLE_INPUT_COLUMNS,
  })
  .extend({
    /** Replaces the tags (customer tags only). */
    tagIds: z.array(Id).max(50).optional(),
    /** Sets the given custom fields; `null` clears one. Others stay. A plugin's field: 403 PLUGIN_FIELD. */
    customFields: CustomFieldsPatch.optional(),
    /** Sets the given Data Extensions values by field key; `null` clears one. Others stay. */
    values: DataExtensionValuesInput.optional(),
  });

export type CustomerInput = z.infer<typeof CustomerFields>;

const identifies = (value: CustomerInput) =>
  Boolean(
    value.firstName ||
    value.lastName ||
    value.primaryEmail ||
    value.primaryPhone ||
    value.emails?.length ||
    value.phones?.length,
  );

/** A company as listed on a customer, with the link. */
export const CompanyRef = createSelectSchema(companies, { id: CompanyId })
  .pick({ id: true, primaryName: true, avatarUrl: true, website: true })
  .extend({ link: ContactLink });

export type CompanyRef = z.infer<typeof CompanyRef>;

const ID = z.object({ id: Id });
const changes = (value: Record<string, unknown>) => Object.keys(value).some((key) => key !== 'id');
const Ids = z.object({ ids: z.array(Id).min(1).max(100) });

/** Fields whose value a merge can take from any of the merged customers. */
export const CustomerMergeField = z.enum(CUSTOMER_MERGE_FIELDS);

export type CustomerMergeField = z.infer<typeof CustomerMergeField>;

const MergeInput = MergeIds.extend({
  fields: z.partialRecord(CustomerMergeField, Id).default({}),
}).refine(namesMerged, MERGE_IDS_MESSAGE);

export type CustomerMerge = z.infer<typeof MergeInput>;

/** Tags to add to and remove from some customers or companies. */
export const TagChange = z.object({
  ids: z.array(Id).min(1).max(100),
  add: z.array(Id).max(50).default([]),
  remove: z.array(Id).max(50).default([]),
});

export type TagChange = z.infer<typeof TagChange>;

const {
  INVALID_ACTOR,
  INVALID_FIELD,
  INVALID_FIELD_VALUE,
  INVALID_OWNER,
  INVALID_TAG,
  INVALID_TYPE,
  MASS_DELETE_STOPPED,
  NOT_A_LEAD,
  PLUGIN_FIELD,
  TAG_LIMIT,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  INVALID_ACTOR,
  INVALID_FIELD,
  INVALID_FIELD_VALUE,
  INVALID_OWNER,
  INVALID_TAG,
  INVALID_TYPE,
  MASS_DELETE_STOPPED,
  NOT_A_LEAD,
  PLUGIN_FIELD,
  TAG_LIMIT,
});

export const customersContract = {
  list: base
    .route({
      method: 'GET',
      path: '/customers',
      summary: 'List customers',
      description: 'Customers of the organisation, newest first',
    })
    .input(
      CursorQuery.extend({
        search: z.string().trim().max(100).optional(),
        state: CustomerState.optional(),
        ownerId: Id.optional(),
        /** Customers with any of these tags. */
        tagIds: IdList.optional(),
        /** Customers of this company. */
        companyId: Id.optional(),
        /** Leads in this stage. */
        leadStageId: Id.optional(),
        ids: IdList.optional(),
        /** An advanced filter: JSON of a condition group (`RecordFilter`), as views save it. */
        filter: z.string().max(20_000).optional(),
      }).extend(DataSortQuery.shape),
    )
    .output(cursorPageOf(CustomerWithValues)),
  findOrCreate: base
    .route({
      method: 'POST',
      path: '/customers/find-or-create',
      summary: 'Find or create a customer',
      description:
        'The customer with this email or phone, or a new one (members with contacts.create; plugins with customers:write). Safe to call twice at once. With only a name there is nothing to match, so it always creates one',
    })
    .input(
      z
        .object({
          primaryEmail: z.string().trim().check(z.email()).max(254).optional(),
          primaryPhone: z.string().trim().min(3).max(40).optional(),
          firstName: z.string().trim().max(100).optional(),
          lastName: z.string().trim().max(100).optional(),
          state: z.enum(CUSTOMER_STATES).optional(),
          /** For a new one: where they came from (default: the plugin, or `manual`). */
          source: CustomerFields.shape.source,
          sourceDetails: CustomerFields.shape.sourceDetails,
        })
        .refine(
          (value) =>
            Boolean(value.primaryEmail || value.primaryPhone || value.firstName || value.lastName),
          'firstName, lastName, primaryEmail or primaryPhone is required',
        ),
    )
    .output(z.object({ customer: Customer, created: z.boolean() })),
  get: base
    .route({
      method: 'GET',
      path: '/customers/{id}',
      summary: 'Get a customer',
      description: 'A customer; ids merged into another customer resolve to it',
    })
    .input(ID)
    .output(CustomerWithValues),
  create: base
    .route({
      method: 'POST',
      path: '/customers',
      successStatus: 201,
      summary: 'Create a customer',
      description: '409 TAKEN (data.field) when the primary email or phone is taken',
    })
    .input(CustomerFields.refine(identifies, 'a name, an email or a phone is required'))
    .output(CustomerWithValues),
  update: base
    .route({
      method: 'PATCH',
      path: '/customers/{id}',
      summary: 'Change a customer',
      description: 'Change the fields sent; custom fields merge into the stored ones',
    })
    .input(CustomerFields.extend({ id: Id }).refine(changes, 'nothing to update'))
    .output(CustomerWithValues),
  remove: base
    .route({
      method: 'POST',
      path: '/customers/remove',
      summary: 'Delete customers',
      description: 'Delete customers (owners and admins)',
    })
    .input(Ids)
    .output(z.object({ removed: z.int() })),
  merge: base
    .route({
      method: 'POST',
      path: '/customers/merge',
      summary: 'Merge customers',
      description:
        'Merge customers into `keepId`: each field in `fields` takes that customer’s value, other empty fields are filled from the others, emails, phones, tags and companies are combined, the others are deleted (owners and admins)',
    })
    .input(MergeInput)
    .output(Customer),
  tag: base
    .route({
      method: 'POST',
      path: '/customers/tag',
      summary: 'Tag or untag customers',
      description: 'Add and remove tags on many customers',
    })
    .input(TagChange)
    .output(z.object({ updated: z.int() })),
  companies: base
    .route({
      method: 'GET',
      path: '/customers/{id}/companies',
      summary: 'List a customer’s companies',
      description: "The customer's companies",
    })
    .input(ID)
    .output(listOf(CompanyRef)),
  linkCompany: base
    .route({
      method: 'PUT',
      path: '/customers/{id}/companies/{companyId}',
      summary: 'Link a customer to a company',
      description: 'Link, or change the link: role, main contact, left',
    })
    .input(ContactLinkInput.extend({ id: Id, companyId: Id }))
    .output(z.object({ ok: z.literal(true) })),
  unlinkCompany: base
    .route({
      method: 'DELETE',
      path: '/customers/{id}/companies/{companyId}',
      summary: 'Unlink a customer from a company',
      description: 'Remove the link between the customer and the company; both records stay',
    })
    .input(z.object({ id: Id, companyId: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
