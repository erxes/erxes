import { apiKeys } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { API_KEY_LIFETIMES } from './values';

export const ApiKey = createSelectSchema(apiKeys, {
  id: Id,
  userId: Id,
  expiresAt: isoDate,
  lastUsedAt: isoDate,
  createdAt: isoDate,
})
  .pick({ id: true, userId: true, name: true, expiresAt: true, lastUsedAt: true, createdAt: true })
  .extend({
    /** The member the key acts as. */
    memberName: z.string().nullable(),
    memberEmail: z.string().nullable(),
  });

export type ApiKey = z.infer<typeof ApiKey>;

const NewApiKey = createUpdateSchema(apiKeys, { name: (name) => name.trim().min(1).max(100) })
  .pick({ name: true })
  .required({ name: true })
  .extend({
    /** Days until it stops working; null: until it is revoked. */
    lifetimeDays: z.literal(API_KEY_LIFETIMES).nullable(),
  });

const { LIMIT_EXCEEDED, SESSION_REQUIRED } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, LIMIT_EXCEEDED, SESSION_REQUIRED });

/**
 * API keys: a member's keys for scripts and other systems, sent as
 * `Authorization: Bearer erxes_<id>.<secret>`. A key acts as its member, with
 * their role at each request. Keys are managed from a signed-in session only
 * (403 SESSION_REQUIRED with a key).
 */
export const apiKeysContract = {
  list: base
    .route({
      method: 'GET',
      path: '/api-keys',
      summary: "Your API keys; everyone's with api_keys.manage",
    })
    .output(listOf(ApiKey)),
  create: base
    .route({
      method: 'POST',
      path: '/api-keys',
      successStatus: 201,
      summary:
        'A new key that acts as you; the key is returned once here. 400 LIMIT_EXCEEDED past 20 keys',
    })
    .input(NewApiKey)
    .output(z.object({ apiKey: ApiKey, key: z.string() })),
  remove: base
    .route({
      method: 'DELETE',
      path: '/api-keys/{id}',
      summary: "Revoke a key, yours or (with api_keys.manage) anyone's; it stops at once",
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
