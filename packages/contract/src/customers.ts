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

/** `lead`: not a customer yet (e.g. a form submission). */
export const CustomerState = z.enum(['lead', 'customer']);
export type CustomerState = z.infer<typeof CustomerState>;

/** ISO/IEC 5218, as in erxes until now: 0 not known, 1 male, 2 female, 9 not applicable. */
export const CustomerSex = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(9)]);
export type CustomerSex = z.infer<typeof CustomerSex>;

/** A person the organisation works with; shared by every plugin. */
export const Customer = z.object({
  id: Id,
  state: CustomerState,
  firstName: z.string().nullable(),
  middleName: z.string().nullable(),
  lastName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  primaryEmail: z.string().nullable(),
  /** Every email address, the primary one first. */
  emails: z.array(z.string()),
  primaryPhone: z.string().nullable(),
  /** Every phone number, the primary one first. */
  phones: z.array(z.string()),
  sex: CustomerSex.nullable(),
  /** `YYYY-MM-DD` */
  birthDate: z.string().nullable(),
  position: z.string().nullable(),
  department: z.string().nullable(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  /** Team member responsible for the customer. */
  ownerId: z.string().nullable(),
  tagIds: z.array(z.string()),
  /** Custom field values by field id. */
  customFields: CustomFields,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Customer = z.infer<typeof Customer>;

const CustomerFields = z.object({
  state: CustomerState.optional(),
  firstName: text(100),
  middleName: text(100),
  lastName: text(100),
  avatarUrl: ImageAddress.nullable().optional(),
  primaryEmail: EmailAddress.nullable().optional(),
  emails: z.array(EmailAddress).max(20).optional(),
  primaryPhone: PhoneNumber.nullable().optional(),
  phones: z.array(PhoneNumber).max(20).optional(),
  sex: CustomerSex.nullable().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
    .nullable()
    .optional(),
  position: text(200),
  department: text(200),
  code: text(100),
  description: text(5000),
  ownerId: Id.nullable().optional(),
  /** Replaces the tags (customer tags only). */
  tagIds: z.array(Id).max(50).optional(),
  /** Sets the given custom fields; `null` clears one. Others stay. */
  customFields: CustomFieldsPatch.optional(),
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

/** A company as listed on a customer. */
export const CompanyRef = z.object({
  id: Id,
  primaryName: z.string(),
  avatarUrl: z.string().nullable(),
  website: z.string().nullable(),
});
export type CompanyRef = z.infer<typeof CompanyRef>;

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

export const customersContract = {
  list: oc
    .route({ method: 'GET', path: '/customers', summary: 'Customers of the organisation, newest first' })
    .input(
      CursorQuery.extend({
        search: z.string().trim().max(100).optional(),
        state: CustomerState.optional(),
        ownerId: Id.optional(),
        /** Customers with any of these tags. */
        tagIds: IdList.optional(),
        /** Customers of this company. */
        companyId: Id.optional(),
        ids: IdList.optional(),
      }),
    )
    .output(cursorPageOf(Customer)),
  findOrCreate: oc
    .route({
      method: 'POST',
      path: '/customers/find-or-create',
      summary:
        'The customer with this email or phone, or a new one (members with contacts.create; plugins with customers:write). Safe to call twice at once',
    })
    .input(
      z
        .object({
          primaryEmail: z.string().trim().email().max(254).optional(),
          primaryPhone: z.string().trim().min(3).max(40).optional(),
          firstName: z.string().trim().max(100).optional(),
          lastName: z.string().trim().max(100).optional(),
          state: z.enum(['lead', 'customer']).optional(),
        })
        .refine((value) => Boolean(value.primaryEmail || value.primaryPhone), 'an email or a phone is required'),
    )
    .output(z.object({ customer: Customer, created: z.boolean() })),
  get: oc
    .route({
      method: 'GET',
      path: '/customers/{id}',
      summary: 'A customer; ids merged into another customer resolve to it',
    })
    .input(ID)
    .output(Customer),
  create: oc
    .route({
      method: 'POST',
      path: '/customers',
      successStatus: 201,
      summary:
        'Create a customer. 409 CUSTOMER_EXISTS (data: { id, field }) when the primary email or phone is taken',
    })
    .input(CustomerFields.refine(identifies, 'a name, an email or a phone is required'))
    .output(Customer),
  update: oc
    .route({ method: 'PATCH', path: '/customers/{id}' })
    .input(CustomerFields.extend({ id: Id }).refine(changes, 'nothing to update'))
    .output(Customer),
  remove: oc
    .route({ method: 'POST', path: '/customers/remove', summary: 'Delete customers (owners and admins)' })
    .input(Ids)
    .output(z.object({ removed: z.number().int() })),
  merge: oc
    .route({
      method: 'POST',
      path: '/customers/merge',
      summary:
        'Merge customers into `keepId`: empty fields are filled from the others, emails, phones, tags and companies are combined, the others are deleted (owners and admins)',
    })
    .input(MergeInput)
    .output(Customer),
  tag: oc
    .route({ method: 'POST', path: '/customers/tag', summary: 'Add and remove tags on many customers' })
    .input(TagChange)
    .output(z.object({ updated: z.number().int() })),
  companies: oc
    .route({ method: 'GET', path: '/customers/{id}/companies', summary: "The customer's companies" })
    .input(ID)
    .output(z.object({ data: z.array(CompanyRef) })),
  linkCompany: oc
    .route({ method: 'PUT', path: '/customers/{id}/companies/{companyId}' })
    .input(z.object({ id: Id, companyId: Id }))
    .output(z.object({ ok: z.literal(true) })),
  unlinkCompany: oc
    .route({ method: 'DELETE', path: '/customers/{id}/companies/{companyId}' })
    .input(z.object({ id: Id, companyId: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
