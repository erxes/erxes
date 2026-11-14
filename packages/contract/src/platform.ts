import { ACTOR_TYPES } from '@erxes/core-db/enums';
import { z } from 'zod';

/**
 * Who did something, stored as `actorType` with `actorId`: a team member (the
 * user id), a plugin (its name, e.g. `hr`), a customer (the customer id) or
 * core itself (`system`, no id).
 */
export const ActorType = z.enum(ACTOR_TYPES);

export type ActorType = z.infer<typeof ActorType>;

/** The type of a plugin's record an entry points at (`entityType`, with `entityId`). */
export const EntityType = z.string().trim().min(1).max(64);

/** An app path inside erxes (`/hr/leaves/abc`), never another site. */
export const AppLink = z
  .string()
  .trim()
  .max(500)
  .regex(/^\/(?!\/)[^\s]*$/, 'an app path starting with /');

/**
 * Makes a plugin's create call safe to retry: the same key creates nothing
 * the second time.
 */
export const DedupeKey = z.string().trim().min(1).max(200);

/** `<source>.<what>`, lower case: `hr.leave.requested`. */
export const EventType = z
  .string()
  .trim()
  .max(100)
  .regex(
    /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/,
    'dotted lower-case name, e.g. hr.leave.requested',
  );
