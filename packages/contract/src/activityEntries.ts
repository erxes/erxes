import { TIMELINE_KINDS } from '@erxes/core-db/enums';
import { activities, notes, noteVersions } from '@erxes/core-db/schema';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate } from './common';
import { AppLink, DedupeKey, EntityType, EventType } from './platform';
import { TimelineTarget } from './timelines';

/**
 * Activity types core records itself; `data` has a known shape for each.
 * Plugin types (`ecom.order.paid`) carry a `summary` instead.
 */
export const CORE_ACTIVITY_TYPES = [
  'customer.created',
  'customer.updated',
  'customer.tagged',
  'customer.merged',
  'customer.company_linked',
  'customer.company_unlinked',
  /** An email to the customer was sent or failed: `{ deliveryId, subject, source, sourceId, status, error }`. */
  'customer.emailed',
  'company.created',
  'company.updated',
  'company.tagged',
  'company.merged',
  'company.customer_linked',
  'company.customer_unlinked',
] as const;

/** What only a note has; its entry says where it is and who wrote it. */
export const Note = createSelectSchema(notes, { pinnedAt: isoDate, editedAt: isoDate }).pick({
  body: true,
  /** Members mentioned with @. */
  mentions: true,
  fileIds: true,
  /** Pinned to the top of the timeline. */
  pinnedAt: true,
  /** Last reworded; earlier wordings are in `noteVersions`. */
  editedAt: true,
});

export type Note = z.infer<typeof Note>;

export const NoteVersion = createSelectSchema(noteVersions, { id: Id, editedAt: isoDate }).pick({
  id: true,
  /** The wording an edit replaced. */
  body: true,
  /** When this wording was written. */
  editedAt: true,
});

export const Activity = createSelectSchema(activities, {
  id: Id,
  targetId: Id,
  data: z.record(z.string(), z.unknown()),
  occurredAt: isoDate,
})
  .pick({
    id: true,
    targetType: true,
    targetId: true,
    /** `core` or the plugin that recorded it. */
    source: true,
    type: true,
    summary: true,
    /**
     * Core types: `updated` → `{ changes: { field: [before, after] } }`;
     * `tagged` → `{ added: ids, removed: ids }`; `merged` → `{ mergedIds }`;
     * `*_linked` → `{ customerId | companyId }`.
     */
    data: true,
    link: true,
    /** The plugin's own record it is about. */
    entityType: true,
    entityId: true,
    /** Who did it: a team member (`actorId` = user id), a plugin (its name) or `system`. */
    actorType: true,
    actorId: true,
    occurredAt: true,
  })
  .extend({
    /** A team member's name and picture, selected with the entry so the timeline reads at once. */
    actorName: z.string().nullable(),
    actorAvatarUrl: z.string().nullable(),
    /** Notes (`<target>.note`) only. */
    note: Note.nullable(),
    /** Emoji → the members who reacted, first reaction first. */
    reactions: z.record(z.string(), z.array(z.string())),
  });

export type Activity = z.infer<typeof Activity>;

/** Notes are timeline entries of type `customer.note` / `company.note`, with `note` set. */
export const NoteInput = z.object({
  body: z.string().trim().min(1).max(10_000),
  /** Team members mentioned with @: they are notified. */
  mentions: z.array(Id).max(50).default([]),
  /** Attached files (uploaded through `/files`). */
  fileIds: z.array(Id).max(20).default([]),
});

/** Which entries a timeline shows. */
export const TimelineKind = z.enum(TIMELINE_KINDS);

export const ActivityInput = createUpdateSchema(activities, {
  targetType: () => TimelineTarget,
  targetId: () => Id,
  type: () => EventType,
  summary: z.string().trim().min(1).max(500),
  data: () => z.record(z.string(), z.unknown()),
  link: AppLink.optional(),
  occurredAt: () => z.iso.datetime(),
  dedupeKey: DedupeKey.optional(),
  entityType: EntityType.optional(),
  entityId: Id.optional(),
})
  .pick({
    targetType: true,
    targetId: true,
    /** Must start with the plugin's name: `ecom.order.paid`. */
    type: true,
    /** The line shown on the timeline. */
    summary: true,
    data: true,
    link: true,
    /** The plugin's own record it is about. */
    entityType: true,
    entityId: true,
    /** When it happened (defaults to now). */
    occurredAt: true,
    /** Retry-safe: one entry per plugin and key. */
    dedupeKey: true,
  })
  .required({ targetType: true, targetId: true, type: true })
  .extend({
    /** The team member who did it, if any. */
    actorUserId: Id.optional(),
  })
  .refine(
    (value) => (value.entityType === undefined) === (value.entityId === undefined),
    'entityType and entityId go together',
  );

export type ActivityInput = z.infer<typeof ActivityInput>;
