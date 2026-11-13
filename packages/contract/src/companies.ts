import { CUSTOMER_STATES } from '@erxes/core-db/enums';
import { companies, customers } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  CursorQuery,
  CustomFields,
  CustomFieldsPatch,
  EmailAddress,
  Id,
  IdList,
  PhoneNumber,
  cursorPageOf,
  ImageAddress,
  isoDate,
} from './common';
import { ContactLink, ContactLinkInput } from './customers';
import { LIFECYCLE_COLUMNS, LIFECYCLE_INPUT_COLUMNS, lifecycleInput, lifecycleRow } from './leads';

/** An organisation the organisation works with; shared by every plugin. */
export const Company = createSelectSchema(companies, {
  id: Id,
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
export const PersonRef = createSelectSchema(customers, { id: Id })
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
  description: (value) => value.trim().max(5000),
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
    customFields: CustomFieldsPatch.optional(),
  });

export type CompanyInput = z.infer<typeof CompanyFields>;

const ID = z.object({ id: Id });
const changes = (value: Record<string, unknown>) => Object.keys(value).some((key) => key !== 'id');
const Ids = z.object({ ids: z.array(Id).min(1).max(100) });

const MergeInput = z
  .object({ ids: z.array(Id).min(2).max(10), keepId: Id })
  .refine((value) => value.ids.includes(value.keepId), 'keepId must be one of ids');

const TagChange = z.object({
  ids: z.array(Id).min(1).max(100),
  add: z.array(Id).max(50).default([]),
  remove: z.array(Id).max(50).default([]),
});

export const companiesContract = {
  list: oc
    .route({
      method: 'GET',
      path: '/companies',
      summary: 'Companies of the organisation, newest first',
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
  get: oc
    .route({
      method: 'GET',
      path: '/companies/{id}',
      summary: 'A company; ids merged into another company resolve to it',
    })
    .input(ID)
    .output(Company),
  create: oc
    .route({
      method: 'POST',
      path: '/companies',
      successStatus: 201,
      summary: 'Create a company. 409 COMPANY_EXISTS (data: { id }) when the name is taken',
    })
    .input(CompanyFields.extend({ primaryName: z.string().trim().min(1).max(200) }))
    .output(Company),
  update: oc
    .route({ method: 'PATCH', path: '/companies/{id}' })
    .input(CompanyFields.extend({ id: Id }).refine(changes, 'nothing to update'))
    .output(Company),
  remove: oc
    .route({
      method: 'POST',
      path: '/companies/remove',
      summary: 'Delete companies (owners and admins)',
    })
    .input(Ids)
    .output(z.object({ removed: z.int() })),
  merge: oc
    .route({
      method: 'POST',
      path: '/companies/merge',
      summary: 'Merge companies into `keepId` (owners and admins), as for customers',
    })
    .input(MergeInput)
    .output(Company),
  tag: oc
    .route({
      method: 'POST',
      path: '/companies/tag',
      summary: 'Add and remove tags on many companies',
    })
    .input(TagChange)
    .output(z.object({ updated: z.int() })),
  people: oc
    .route({
      method: 'GET',
      path: '/companies/{id}/people',
      summary: "The company's people: main contact first, then current, then former",
    })
    .input(ID)
    .output(z.object({ data: z.array(PersonRef) })),
  linkPerson: oc
    .route({
      method: 'PUT',
      path: '/companies/{id}/people/{customerId}',
      summary: 'Link a person (or change the link), as from the person',
    })
    .input(ContactLinkInput.extend({ id: Id, customerId: Id }))
    .output(z.object({ ok: z.literal(true) })),
  unlinkPerson: oc
    .route({ method: 'DELETE', path: '/companies/{id}/people/{customerId}' })
    .input(z.object({ id: Id, customerId: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
