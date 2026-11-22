import { apiKeys } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import {
  API_KEY_LIFETIMES,
  ApiKeyAccess,
  ApiKeyActions,
  ApiKeyArea,
  ApiKeyAreas,
  ApiKeyKind,
  ApiKeyPlugins,
} from './values';

export const ApiKey = createSelectSchema(apiKeys, {
  id: Id,
  userId: Id,
  kind: ApiKeyKind,
  areas: ApiKeyAreas,
  pluginAccess: ApiKeyPlugins,
  actions: ApiKeyActions,
  expiresAt: isoDate,
  lastUsedAt: isoDate,
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    userId: true,
    name: true,
    kind: true,
    areas: true,
    pluginAccess: true,
    actions: true,
    ownRecords: true,
    unitIds: true,
    tagIds: true,
    allowedIps: true,
    expiresAt: true,
    lastUsedAt: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    /** The member who made it. */
    memberName: z.string().nullable(),
    memberEmail: z.string().nullable(),
  });

export type ApiKey = z.infer<typeof ApiKey>;

/** An address (`203.0.113.7`) or range (`10.0.0.0/8`), IPv4 or IPv6. */
const IpRange = z.union([z.ipv4(), z.ipv6(), z.cidrv4(), z.cidrv6()]);

const KeyRules = createUpdateSchema(apiKeys, { name: (name) => name.trim().min(1).max(100) })
  .pick({ name: true })
  .required({ name: true })
  .extend({
    kind: ApiKeyKind.exclude(['member']),
    /** At least one area, all of the key's kind. */
    areas: ApiKeyAreas,
    /**
     * Regular keys: the installed plugins whose APIs it may call (`plugins.session`), read only
     * or read and write. Not with contact limits: plugins keep their own records.
     */
    pluginAccess: ApiKeyPlugins.default({}),
    /**
     * Where it does only some things: an area's API calls, a plugin's actions. The area opens
     * for writing when one of its calls writes; the plugin opens for writing.
     */
    actions: ApiKeyActions.default({}),
    /** Regular keys: only contacts the maker owns. */
    ownRecords: z.boolean().default(false),
    /** Regular keys: only contacts owned by members of these units or units under them. */
    unitIds: z.array(Id).max(50).default([]),
    /** Regular keys: only contacts with one of these tags. */
    tagIds: z.array(Id).max(50).default([]),
    /** Addresses and ranges it may call from; none for any. */
    allowedIps: z.array(IpRange).max(20).default([]),
    /** Days until it stops working; null: until it is revoked (regular keys only). */
    lifetimeDays: z.literal(API_KEY_LIFETIMES).nullable(),
  });

const KeyDecision = z.object({
  allowed: z.boolean(),
  /** The rule that decided: `area:contacts:read`, `kind:management`, `ip`, `expired`, `rows`, … */
  rule: z.string(),
  reason: z.string(),
});

/** A procedure as keys see it: the area and access it needs, or null when no key calls it. */
const KeyCall = z.object({
  procedure: z.string(),
  method: z.string(),
  path: z.string(),
  summary: z.string().nullable(),
  description: z.string().nullable(),
  area: z.union([ApiKeyArea, z.literal('lookup')]).nullable(),
  access: ApiKeyAccess,
  /** The permission a member needs for it; null when any member may make it. */
  permission: z.string().nullable(),
});

const { BEYOND_OWN_PERMISSIONS, LIMIT_EXCEEDED, SESSION_REQUIRED, OWNER_ONLY } = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  BEYOND_OWN_PERMISSIONS,
  LIMIT_EXCEEDED,
  SESSION_REQUIRED,
  OWNER_ONLY,
});

/**
 * API keys: the organisation's keys for scripts and other systems, sent as
 * `Authorization: Bearer erxes_<id>.<secret>`. A regular key works with data, a management
 * key with organisation setup, each within its rules and never beyond what its maker could
 * do. Keys made before rules (`member`) act as their maker. Keys are made and edited from a
 * signed-in session only (403 SESSION_REQUIRED with a key).
 */
export const apiKeysContract = {
  list: base
    .route({
      method: 'GET',
      path: '/api-keys',
      summary: 'List API keys',
      description: "Your API keys; everyone's with api_keys.manage",
    })
    .output(listOf(ApiKey)),
  create: base
    .route({
      method: 'POST',
      path: '/api-keys',
      successStatus: 201,
      summary: 'Create an API key',
      description:
        'A new key; the key is returned once here. 403 OWNER_ONLY: a management key needs an owner or admin. 403 BEYOND_OWN_PERMISSIONS: an area your role lacks. 400 LIMIT_EXCEEDED past 20 keys',
    })
    .input(KeyRules)
    .output(z.object({ apiKey: ApiKey, key: z.string() })),
  update: base
    .route({
      method: 'PATCH',
      path: '/api-keys/{id}',
      summary: 'Change an API key',
      description:
        'Change a key you made: its name and rules (a key made before rules takes them now). The secret stays; a lifetime given starts again from now',
    })
    .input(KeyRules.extend({ id: Id, lifetimeDays: KeyRules.shape.lifetimeDays.optional() }))
    .output(ApiKey),
  remove: base
    .route({
      method: 'DELETE',
      path: '/api-keys/{id}',
      summary: 'Revoke an API key',
      description: "Revoke a key, yours or (with api_keys.manage) anyone's; it stops at once",
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  calls: base
    .route({
      method: 'GET',
      path: '/api-keys/calls',
      summary: 'List the calls a key can make',
      description: 'Every procedure, with the area and access a key needs for it',
    })
    .output(listOf(KeyCall)),
  try: base
    .route({
      method: 'POST',
      path: '/api-keys/{id}/try',
      summary: 'Check what a key may call',
      description:
        'Would the key be allowed each call it can be given (from this address, on this contact)? Says which rule decided each; nothing is called',
    })
    .input(
      z.object({
        id: Id,
        recordId: Id.optional(),
        ip: z.union([z.ipv4(), z.ipv6()]).optional(),
      }),
    )
    .output(listOf(KeyDecision.extend({ procedure: z.string() }))),
};
