import { z } from 'zod';
import { Id } from './common';

/**
 * Who did something: a team member (`id` = user id), a plugin (`id` = plugin
 * name, e.g. `hr`) or core itself (`system`). Names are resolved when shown.
 */
export const ActorRef = z.object({
  type: z.enum(['user', 'plugin', 'system']),
  id: z.string().nullable(),
});
export type ActorRef = z.infer<typeof ActorRef>;

/** A record in a plugin that an entry points at. */
export const EntityRef = z.object({
  type: z.string().trim().min(1).max(64),
  id: Id,
});
export type EntityRef = z.infer<typeof EntityRef>;

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
  .regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, 'dotted lower-case name, e.g. hr.leave.requested');
