import { ACTIVITY_TARGETS, TIMELINE_KINDS } from '@erxes/core-db/enums';
import { activities, notes, noteVersions } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, Id, isoDate, QueryFlag } from './common';
import { AppLink, DedupeKey, EntityType, EventType } from './platform';

export const ActivityTarget = z.enum(ACTIVITY_TARGETS);

export type ActivityTarget = z.infer<typeof ActivityTarget>;

/**
 * What a timeline is about: a customer or company, or a plugin's own record
 * type declared in its manifest (`hr.employee`, `ecom.order`).
 */
export const TimelineTarget = z.union([
  ActivityTarget,
  z.string().regex(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/, 'customer, company or <plugin>.<type>'),
]);

export type TimelineTarget = z.infer<typeof TimelineTarget>;

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

/** The customer and company timeline, across core and plugins. */
export const activitiesContract = {
  list: oc
    .route({
      method: 'GET',
      path: '/activities',
      summary: 'A customer’s or company’s timeline, newest first',
    })
    .input(
      CursorQuery.extend({
        targetType: TimelineTarget,
        targetId: Id,
        source: z.string().trim().max(40).optional(),
        /** Text in notes and plugin lines. */
        q: z.string().trim().max(100).optional(),
        /** Done by this member. */
        actorId: Id.optional(),
        from: z.iso.datetime().optional(),
        to: z.iso.datetime().optional(),
        kind: TimelineKind.default('all'),
        /** Pinned notes only. */
        pinned: QueryFlag.optional(),
        /** A company's timeline with its customers' entries too. */
        includeRelated: QueryFlag.optional(),
      }),
    )
    .output(cursorPageOf(Activity)),
  addNote: oc
    .route({
      method: 'POST',
      path: '/activities/notes',
      successStatus: 201,
      summary: 'Add a note to a timeline',
    })
    .input(NoteInput.extend({ targetType: TimelineTarget, targetId: Id }))
    .output(Activity),
  react: oc
    .route({
      method: 'POST',
      path: '/activities/{id}/reactions',
      summary: 'Add or take back a reaction (an emoji) on an entry',
    })
    .input(z.object({ id: Id, emoji: z.string().trim().min(1).max(16) }))
    .output(Activity),
  types: oc
    .route({
      method: 'GET',
      path: '/activities/types',
      summary: "Timeline entry types and plugin record timelines: core's and installed plugins'",
    })
    .output(
      z.object({
        types: z.array(
          z.object({
            type: z.string(),
            label: z.string(),
            source: z.string(),
            icon: z.string().nullable(),
            color: z.string().nullable(),
          }),
        ),
        timelines: z.array(
          z.object({
            type: z.string(),
            label: z.string(),
            source: z.string(),
            permission: z.string().nullable(),
          }),
        ),
      }),
    ),
  editNote: oc
    .route({
      method: 'PATCH',
      path: '/activities/notes/{id}',
      summary:
        'Edit a note (its author only). A new wording keeps the old one in `noteVersions`; newly mentioned members are notified',
    })
    .input(
      z
        .object({
          id: Id,
          body: NoteInput.shape.body.optional(),
          mentions: z.array(Id).max(50).optional(),
          fileIds: z.array(Id).max(20).optional(),
        })
        .refine(
          (value) =>
            value.body !== undefined || value.mentions !== undefined || value.fileIds !== undefined,
          'Change the body, the mentions or the files',
        ),
    )
    .output(Activity),
  pinNote: oc
    .route({
      method: 'PUT',
      path: '/activities/notes/{id}/pinned',
      summary: 'Pin a note to the top of its timeline, or unpin it (any member)',
    })
    .input(z.object({ id: Id, pinned: z.boolean() }))
    .output(Activity),
  noteVersions: oc
    .route({
      method: 'GET',
      path: '/activities/notes/{id}/versions',
      summary: "A note's earlier wordings, newest first (the latest 100)",
    })
    .input(z.object({ id: Id }))
    .output(z.object({ data: z.array(NoteVersion).max(100) })),
  removeNote: oc
    .route({
      method: 'DELETE',
      path: '/activities/notes/{id}',
      summary: 'Delete a note (its author, owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  create: oc
    .route({
      method: 'POST',
      path: '/activities',
      successStatus: 201,
      summary:
        'Add to a customer’s or company’s timeline (plugins only). 404 when the record does not exist',
    })
    .input(ActivityInput)
    .output(z.object({ activity: Activity, created: z.boolean() })),
  update: oc
    .route({
      method: 'PATCH',
      path: '/activities/{id}',
      summary:
        "Change a plugin's own entry (by id, or by its dedupe key with id `key:<dedupeKey>`) — the order was refunded, the line changes",
    })
    .input(
      z
        .object({
          id: z.string().min(1).max(260),
          summary: z.string().trim().min(1).max(500).optional(),
          data: z.record(z.string(), z.unknown()).optional(),
          link: AppLink.nullable().optional(),
        })
        .refine(
          (value) =>
            value.summary !== undefined || value.data !== undefined || value.link !== undefined,
          'Change the summary, the data or the link',
        ),
    )
    .output(Activity),
  remove: oc
    .route({
      method: 'DELETE',
      path: '/activities/{id}',
      summary: "Remove a plugin's own entry (by id or `key:<dedupeKey>`)",
    })
    .input(z.object({ id: z.string().min(1).max(260) }))
    .output(z.object({ ok: z.literal(true) })),
};
