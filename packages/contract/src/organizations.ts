import { organizations } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { EmailAddress, Id, isoDate, PhoneNumber } from './common';
import { Country, Currency, TimeZone } from './money';

/**
 * 3.x's "With team member restrictions": while on, members other than owners see the records of
 * their own branches and departments (and those under them), except the members listed for every
 * branch or every department. `units.restrictions` answers what one member is limited to.
 */
export const MemberRestrictions = z.object({
  enabled: z.boolean(),
  /** Members who see every branch. */
  allBranchesUserIds: z.array(Id).max(500),
  /** Members who see every department. */
  allDepartmentsUserIds: z.array(Id).max(500),
});

export type MemberRestrictions = z.infer<typeof MemberRestrictions>;

export const Organization = createSelectSchema(organizations, {
  id: Id,
  createdAt: isoDate,
  memberRestrictions: () => MemberRestrictions,
}).pick({
  id: true,
  subdomain: true,
  name: true,
  /** Where the organisation works (ISO 3166, `MN`); null until chosen. Plugins use it for local rules (taxes, receipts). */
  country: true,
  /** What it charges in (ISO 4217, `MNT`): new products and invoices default to it. */
  currency: true,
  /** The other currencies it trades in (ISO 4217), in its order: plugins offer these besides `currency`. */
  currencies: true,
  /** IANA (`Asia/Ulaanbaatar`): the wall clock and the day every schedule runs by. */
  timezone: true,
  /** Its phone number, as its documents print it (3.x's structure phone number); null if none. */
  phone: true,
  /** Its email address, as its documents print it (3.x's structure email); null if none. */
  email: true,
  memberRestrictions: true,
  createdAt: true,
});

export type Organization = z.infer<typeof Organization>;

/** What an owner may change. */
const OrganizationFields = createUpdateSchema(organizations, {
  country: Country.optional(),
  currency: () => Currency,
  currencies: () =>
    z
      .array(Currency)
      .max(50)
      .refine((codes) => new Set(codes).size === codes.length, 'each currency once'),
  name: (name) => name.trim().min(1).max(100),
  timezone: () => TimeZone,
  phone: () => PhoneNumber.nullable(),
  email: () => EmailAddress.nullable(),
  memberRestrictions: () => MemberRestrictions,
});

/** Where an organisation works; the currency defaults to the country's. */
export const OrganizationRegion = OrganizationFields.pick({ country: true, currency: true });

const {
  BEYOND_OWN_PERMISSIONS,
  BUILTIN_ROLE,
  FIXED_ROLE,
  INVALID_CLIENT,
  INVALID_REFERENCE,
  INVALID_SUBDOMAIN,
  LAST_OPEN_STAGE,
  LEAD_STAGE_IN_USE,
  NAMESPACE_REQUIRED,
  NOT_INSTALLED,
  OWNER_ONLY_PERMISSION,
  ROLE_IN_USE,
  ROLE_NOT_FOUND,
  UNKNOWN_PERMISSION,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  BEYOND_OWN_PERMISSIONS,
  BUILTIN_ROLE,
  FIXED_ROLE,
  INVALID_CLIENT,
  INVALID_REFERENCE,
  INVALID_SUBDOMAIN,
  LAST_OPEN_STAGE,
  LEAD_STAGE_IN_USE,
  NAMESPACE_REQUIRED,
  NOT_INSTALLED,
  OWNER_ONLY_PERMISSION,
  ROLE_IN_USE,
  ROLE_NOT_FOUND,
  UNKNOWN_PERMISSION,
});

export const organizationsContract = {
  current: base
    .route({
      method: 'GET',
      path: '/organization',
      summary: 'The organisation of the signed-in member or the plugin token',
    })
    .output(Organization),
  update: base
    .route({
      method: 'PATCH',
      path: '/organization',
      summary:
        "Rename the organisation or change its country, currency, other currencies, time zone, phone, email or team member restrictions. Products and invoices keep the currency they were made in; a new country without a currency also sets the country's currency. Scheduled and date automations move to the new time zone's wall clock",
    })
    .input(
      OrganizationFields.pick({
        country: true,
        currency: true,
        /** Replaces the list; `currency` itself needn't be in it. */
        currencies: true,
        name: true,
        timezone: true,
        /** null clears it. */
        phone: true,
        /** null clears it. */
        email: true,
        /** Replaces the restrictions; INVALID_REFERENCE (`memberRestrictions`) for someone not on the team. */
        memberRestrictions: true,
      }).refine(
        (input) => Object.values(input).some((value) => value !== undefined),
        'Nothing to change',
      ),
    )
    .output(Organization),
};
