import { oc } from '@orpc/contract';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, Id } from './common';
import { ActorRef, AppLink, DedupeKey, EntityRef, EventType } from './platform';

export const ActivityTarget = z.enum(['customer', 'company']);
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

export const Activity = z.object({
  id: Id,
  targetType: z.string(),
  targetId: Id,
  /** `core` or the plugin that recorded it. */
  source: z.string(),
  type: z.string(),
  summary: z.string().nullable(),
  /**
   * Core types: `updated` → `{ changes: { field: [before, after] } }`;
   * `tagged` → `{ added: ids, removed: ids }`; `merged` → `{ mergedIds }`;
   * `*_linked` → `{ customerId | companyId }`.
   */
  data: z.record(z.unknown()),
  entity: EntityRef.nullable(),
  link: z.string().nullable(),
  actor: ActorRef,
  /** Notes only. */
  pinned: z.boolean(),
  editedAt: z.string().datetime().nullable(),
  /** Emoji → the members who reacted. */
  reactions: z.record(z.array(z.string())),
  occurredAt: z.string().datetime(),
});
export type Activity = z.infer<typeof Activity>;

/** Notes are timeline entries of type `customer.note` / `company.note`; `data` = `{ body, mentions, fileIds }`. */
export const NoteInput = z.object({
  body: z.string().trim().min(1).max(10_000),
  /** Team members mentioned with @: they are notified. */
  mentions: z.array(Id).max(50).default([]),
  /** Attached files (uploaded through `/files`). */
  fileIds: z.array(Id).max(20).default([]),
});

/** Which entries a timeline shows. */
export const TimelineKind = z.enum(['all', 'notes', 'changes', 'plugins']);

export const ActivityInput = z.object({
  targetType: TimelineTarget,
  targetId: Id,
  /** Must start with the plugin's name: `ecom.order.paid`. */
  type: EventType,
  /** The line shown on the timeline. */
  summary: z.string().trim().min(1).max(500),
  data: z.record(z.unknown()).optional(),
  entity: EntityRef.optional(),
  link: AppLink.optional(),
  /** The team member who did it, if any. */
  actorUserId: Id.optional(),
  /** When it happened (defaults to now). */
  occurredAt: z.string().datetime().optional(),
  /** Retry-safe: one entry per plugin and key. */
  dedupeKey: DedupeKey.optional(),
});
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
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        kind: TimelineKind.default('all'),
        /** Pinned notes only. */
        pinned: z
          .enum(['true', 'false'])
          .transform((value) => value === 'true')
          .optional(),
        /** A company's timeline with its customers' entries too. */
        includeRelated: z
          .enum(['true', 'false'])
          .transform((value) => value === 'true')
          .optional(),
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
  updateNote: oc
    .route({
      method: 'PATCH',
      path: '/activities/notes/{id}',
      summary: 'Edit a note (its author) or pin / unpin it (any member)',
    })
    .input(
      z.object({
        id: Id,
        body: NoteInput.shape.body.optional(),
        mentions: z.array(Id).max(50).optional(),
        fileIds: z.array(Id).max(20).optional(),
        pinned: z.boolean().optional(),
      }),
    )
    .output(Activity),
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
      z.object({
        id: z.string().min(1).max(260),
        summary: z.string().trim().min(1).max(500).optional(),
        data: z.record(z.unknown()).optional(),
        link: AppLink.nullable().optional(),
      }),
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
