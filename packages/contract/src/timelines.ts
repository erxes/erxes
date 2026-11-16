import { ACTIVITY_TARGETS } from '@erxes/core-db/enums';
import { z } from 'zod';

export const ActivityTarget = z.enum(ACTIVITY_TARGETS);

export type ActivityTarget = z.infer<typeof ActivityTarget>;

/** A plugin's own record type with a timeline: `<plugin>.<type>`. */
const PLUGIN_TIMELINE_TYPE = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;

/**
 * What a timeline is about: a customer or company, or a plugin's own record
 * type declared in its manifest (`hr.employee`, `ecom.order`).
 */
export const TimelineTarget = z.union([
  ActivityTarget,
  z.string().regex(PLUGIN_TIMELINE_TYPE, 'customer, company or <plugin>.<type>'),
]);

export type TimelineTarget = z.infer<typeof TimelineTarget>;

/** One of a manifest's `timelines`: a record type of the plugin's, and who may see its timeline. */
export const PluginTimeline = z.object({
  type: z.string().regex(PLUGIN_TIMELINE_TYPE),
  label: z.string().trim().min(1).max(100),
  /** A permission action of the plugin (`hr.employee.view`); none: every member. */
  permission: z.string().optional(),
  /**
   * Some members may not read some records (a ticket only its channel's members read):
   * before a member reads or notes on one's timeline, core POSTs a `RecordAccessCheck` to
   * `<api.url>/timelines/access` and refuses unless the plugin answers `{ "allowed": true }`
   * within 5 seconds.
   */
  recordAccess: z.boolean().optional(),
});

/**
 * What core POSTs to `<api.url>/timelines/access` for a timeline with `recordAccess`: may this
 * member read this record? The plugin answers `RecordAccessAnswer`.
 */
export const RecordAccessCheck = z.object({
  orgId: z.string(),
  userId: z.string(),
  /** The timeline type, `frontline.ticket`. */
  type: z.string(),
  id: z.string(),
});

export type RecordAccessCheck = z.infer<typeof RecordAccessCheck>;

export const RecordAccessAnswer = z.object({ allowed: z.boolean() });
