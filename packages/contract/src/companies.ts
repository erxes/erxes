import { oc } from '@orpc/contract';
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
  text,
  ImageAddress,
} from './common';
import { ContactLink, ContactLinkInput } from './customers';
import { LifecycleFields, LifecycleInput } from './leads';

/** An organisation the organisation works with; shared by every plugin. */
export const Company = z.object({
  id: Id,
  primaryName: z.string(),
  /** Every name, the primary one first. */
  names: z.array(z.string()),
  avatarUrl: z.string().nullable(),
  primaryEmail: z.string().nullable(),
  emails: z.array(z.string()),
  primaryPhone: z.string().nullable(),
  phones: z.array(z.string()),
  website: z.string().nullable(),
  industry: z.string().nullable(),
  /** Number of employees. */
  size: z.number().int().nullable(),
  businessType: z.string().nullable(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  ownerId: z.string().nullable(),
  tagIds: z.array(z.string()),
  customFields: CustomFields,
  ...LifecycleFields,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Company = z.infer<typeof Company>;

/** A person as listed on a company, with the link. */
export const PersonRef = z.object({
  id: Id,
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  primaryEmail: z.string().nullable(),
  primaryPhone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  state: z.enum(['lead', 'customer']),
  link: ContactLink,
});
export type PersonRef = z.infer<typeof PersonRef>;

export const CompanyFields = z.object({
  primaryName: z.string().trim().min(1).max(200).optional(),
  names: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
  avatarUrl: ImageAddress.nullable().optional(),
  primaryEmail: EmailAddress.nullable().optional(),
  emails: z.array(EmailAddress).max(20).optional(),
  primaryPhone: PhoneNumber.nullable().optional(),
  phones: z.array(PhoneNumber).max(20).optional(),
  website: z.string().trim().max(500).nullable().optional(),
  industry: text(200),
  size: z.number().int().min(0).max(10_000_000).nullable().optional(),
  businessType: text(200),
  code: text(100),
  description: text(5000),
  ownerId: Id.nullable().optional(),
  tagIds: z.array(Id).max(50).optional(),
  customFields: CustomFieldsPatch.optional(),
  ...LifecycleInput,
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
    .route({ method: 'GET', path: '/companies', summary: 'Companies of the organisation, newest first' })
    .input(
      CursorQuery.extend({
        search: z.string().trim().max(100).optional(),
        state: z.enum(['lead', 'customer']).optional(),
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
    .route({ method: 'POST', path: '/companies/remove', summary: 'Delete companies (owners and admins)' })
    .input(Ids)
    .output(z.object({ removed: z.number().int() })),
  merge: oc
    .route({
      method: 'POST',
      path: '/companies/merge',
      summary: 'Merge companies into `keepId` (owners and admins), as for customers',
    })
    .input(MergeInput)
    .output(Company),
  tag: oc
    .route({ method: 'POST', path: '/companies/tag', summary: 'Add and remove tags on many companies' })
    .input(TagChange)
    .output(z.object({ updated: z.number().int() })),
  people: oc
    .route({ method: 'GET', path: '/companies/{id}/people', summary: "The company's people: main contact first, then current, then former" })
    .input(ID)
    .output(z.object({ data: z.array(PersonRef) })),
  linkPerson: oc
    .route({ method: 'PUT', path: '/companies/{id}/people/{customerId}', summary: 'Link a person (or change the link), as from the person' })
    .input(ContactLinkInput.extend({ id: Id, customerId: Id }))
    .output(z.object({ ok: z.literal(true) })),
  unlinkPerson: oc
    .route({ method: 'DELETE', path: '/companies/{id}/people/{customerId}' })
    .input(z.object({ id: Id, customerId: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
