import { COMPANY_MERGE_FIELDS, CUSTOMER_STATES } from '@erxes/core-db/enums';
import { companies, customers } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
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
  MERGE_IDS_MESSAGE,
  MergeIds,
  namesMerged,
} from './common';
import { ContactLink, ContactLinkInput, TagChange } from './customers';
import { LIFECYCLE_COLUMNS, LIFECYCLE_INPUT_COLUMNS, lifecycleInput, lifecycleRow } from './leads';
import { CompanyId, CustomerId } from './records';

/** An organisation the organisation works with; shared by every plugin. */
export const Company = createSelectSchema(companies, {
  id: CompanyId,
  size: () => z.int(),
  createdAt: isoDate,
  updatedAt: isoDate,
  ...lifecycleRow,
})
  .pick({
    id: true,
    primaryName: true,
    /** Every name, the primary one first. */
    names: true,
    avatarUrl: true,
    primaryEmail: true,
    emails: true,
    primaryPhone: true,
    phones: true,
    website: true,
    industry: true,
    /** Number of employees. */
    size: true,
    businessType: true,
    code: true,
    description: true,
    ownerId: true,
    ...LIFECYCLE_COLUMNS,
    createdAt: true,
    updatedAt: true,
  })
  .extend({ tagIds: z.array(z.string()), customFields: CustomFields });

export type Company = z.infer<typeof Company>;

/** A person as listed on a company, with the link. */
export const PersonRef = createSelectSchema(customers, { id: CustomerId })
  .pick({
    id: true,
    firstName: true,
    lastName: true,
    primaryEmail: true,
    primaryPhone: true,
    avatarUrl: true,
    state: true,
  })
  .extend({ link: ContactLink });

export type PersonRef = z.infer<typeof PersonRef>;

const companyName = () => z.string().trim().min(1).max(200);

export const CompanyFields = createUpdateSchema(companies, {
  primaryName: companyName,
  names: () => z.array(companyName()).max(20),
  avatarUrl: () => ImageAddress,
  primaryEmail: () => EmailAddress,
  emails: () => z.array(EmailAddress).max(20),
  primaryPhone: () => PhoneNumber,
  phones: () => z.array(PhoneNumber).max(20),
  website: (website) => website.trim().max(500),
  industry: (value) => value.trim().max(200),
  size: () => z.int().min(0).max(10_000_000),
  businessType: (value) => value.trim().max(200),
  code: (code) => code.trim().max(100),
  description: (value) => value.trim().max(DESCRIPTION_MAX),
  ownerId: () => Id,
  ...lifecycleInput,
})
  .pick({
    primaryName: true,
    names: true,
    avatarUrl: true,
    primaryEmail: true,
    emails: true,
    primaryPhone: true,
    phones: true,
    website: true,
    industry: true,
    size: true,
    businessType: true,
    code: true,
    description: true,
    ownerId: true,
    ...LIFECYCLE_INPUT_COLUMNS,
  })
  .extend({
    tagIds: z.array(Id).max(50).optional(),
    /** Sets the given custom fields; `null` clears one. Others stay. A plugin's field: 403 PLUGIN_FIELD. */
    customFields: CustomFieldsPatch.optional(),
  });

export type CompanyInput = z.infer<typeof CompanyFields>;

const ID = z.object({ id: Id });
const changes = (value: Record<string, unknown>) => Object.keys(value).some((key) => key !== 'id');
const Ids = z.object({ ids: z.array(Id).min(1).max(100) });

/** Fields whose value a merge can take from any of the merged companies. */
export const CompanyMergeField = z.enum(COMPANY_MERGE_FIELDS);

export type CompanyMergeField = z.infer<typeof CompanyMergeField>;

const MergeInput = MergeIds.extend({
  fields: z.partialRecord(CompanyMergeField, Id).default({}),
}).refine(namesMerged, MERGE_IDS_MESSAGE);

export type CompanyMerge = z.infer<typeof MergeInput>;

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

export const companiesContract = {
  list: base
    .route({
      method: 'GET',
      path: '/companies',
      summary: 'List companies',
      description: 'Companies of the organisation, newest first',
    })
    .input(
      CursorQuery.extend({
        search: z.string().trim().max(100).optional(),
        state: z.enum(CUSTOMER_STATES).optional(),
        /** Leads in this stage. */
        leadStageId: Id.optional(),
        ownerId: Id.optional(),
        tagIds: IdList.optional(),
        /** Companies of this customer. */
        customerId: Id.optional(),
        ids: IdList.optional(),
        /** An advanced filter: JSON of a condition group (`RecordFilter`), as views save it. */
        filter: z.string().max(20_000).optional(),
      }),
    )
    .output(cursorPageOf(Company)),
  get: base
    .route({
      method: 'GET',
      path: '/companies/{id}',
      summary: 'Get a company',
      description: 'A company; ids merged into another company resolve to it',
    })
    .input(ID)
    .output(Company),
  create: base
    .route({
      method: 'POST',
      path: '/companies',
      successStatus: 201,
      summary: 'Create a company',
      description: '409 TAKEN when the name is taken',
    })
    .input(CompanyFields.extend({ primaryName: z.string().trim().min(1).max(200) }))
    .output(Company),
  update: base
    .route({
      method: 'PATCH',
      path: '/companies/{id}',
      summary: 'Change a company',
      description: 'Change the fields sent; custom fields merge into the stored ones',
    })
    .input(CompanyFields.extend({ id: Id }).refine(changes, 'nothing to update'))
    .output(Company),
  remove: base
    .route({
      method: 'POST',
      path: '/companies/remove',
      summary: 'Delete companies',
      description: 'Delete companies (owners and admins)',
    })
    .input(Ids)
    .output(z.object({ removed: z.int() })),
  merge: base
    .route({
      method: 'POST',
      path: '/companies/merge',
      summary: 'Merge companies',
      description:
        'Merge companies into `keepId` (owners and admins), as for customers; the others’ names become extra names',
    })
    .input(MergeInput)
    .output(Company),
  tag: base
    .route({
      method: 'POST',
      path: '/companies/tag',
      summary: 'Tag or untag companies',
      description: 'Add and remove tags on many companies',
    })
    .input(TagChange)
    .output(z.object({ updated: z.int() })),
  people: base
    .route({
      method: 'GET',
      path: '/companies/{id}/people',
      summary: 'List a company’s people',
      description: "The company's first 500 people: main contact first, then current, then former",
    })
    .input(ID)
    .output(z.object({ data: z.array(PersonRef).max(500) })),
  linkPerson: base
    .route({
      method: 'PUT',
      path: '/companies/{id}/people/{customerId}',
      summary: 'Link a person to a company',
      description: 'Link a person (or change the link), as from the person',
    })
    .input(ContactLinkInput.extend({ id: Id, customerId: Id }))
    .output(z.object({ ok: z.literal(true) })),
  unlinkPerson: base
    .route({
      method: 'DELETE',
      path: '/companies/{id}/people/{customerId}',
      summary: 'Unlink a person from a company',
      description: 'Remove the link between the company and the customer; both records stay',
    })
    .input(z.object({ id: Id, customerId: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
