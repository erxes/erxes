import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { z } from 'zod';
import { Activity, ActivityInput, NoteInput, NoteVersion, TimelineKind } from './activityEntries';
import { cursorPageOf, CursorQuery, Id, QueryFlag } from './common';
import { AppLink, DedupeKey } from './platform';
import { TimelineTarget } from './timelines';

/** The customer and company timeline, across core and plugins. */
const {
  INVALID_ACTOR,
  INVALID_FILE,
  INVALID_OWNER,
  INVALID_RECIPIENT,
  INVALID_TYPE,
  MASS_DELETE_STOPPED,
  NOT_AUTHOR,
  NO_TIMELINE,
  TOO_MANY_REACTIONS,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  INVALID_ACTOR,
  INVALID_FILE,
  INVALID_OWNER,
  INVALID_RECIPIENT,
  INVALID_TYPE,
  MASS_DELETE_STOPPED,
  NOT_AUTHOR,
  NO_TIMELINE,
  TOO_MANY_REACTIONS,
});

export const activitiesContract = {
  list: base
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
  byMember: base
    .route({
      method: 'GET',
      path: '/activities/members/{actorId}',
      summary:
        'What a team member did on the timelines the caller may read, newest first. Timelines whose plugin checks each record (`recordAccess`) are left out',
    })
    .input(
      CursorQuery.extend({
        actorId: Id,
        source: z.string().trim().max(40).optional(),
        /** Text in notes and plugin lines. */
        q: z.string().trim().max(100).optional(),
        from: z.iso.datetime().optional(),
        to: z.iso.datetime().optional(),
        kind: TimelineKind.default('all'),
      }),
    )
    .output(cursorPageOf(Activity)),
  addNote: base
    .route({
      method: 'POST',
      path: '/activities/notes',
      successStatus: 201,
      summary: 'Add a note to a timeline',
    })
    .input(NoteInput.extend({ targetType: TimelineTarget, targetId: Id }))
    .output(Activity),
  importNote: base
    .route({
      method: 'POST',
      path: '/activities/notes/import',
      successStatus: 201,
      summary:
        'Bring a note over from old erxes, with its author and time (plugins only). Nobody is notified; a retried `dedupeKey` returns the note made the first time',
    })
    .input(
      z.object({
        targetType: TimelineTarget,
        targetId: Id,
        body: NoteInput.shape.body,
        /** The team member who wrote it. */
        authorId: Id,
        createdAt: z.iso.datetime(),
        dedupeKey: DedupeKey,
      }),
    )
    .output(z.object({ activity: Activity, created: z.boolean() })),
  react: base
    .route({
      method: 'POST',
      path: '/activities/{id}/reactions',
      summary: 'Add or take back a reaction (an emoji) on an entry',
    })
    .input(z.object({ id: Id, emoji: z.string().trim().min(1).max(16) }))
    .output(Activity),
  types: base
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
  editNote: base
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
  pinNote: base
    .route({
      method: 'PUT',
      path: '/activities/notes/{id}/pinned',
      summary: 'Pin a note to the top of its timeline, or unpin it (any member)',
    })
    .input(z.object({ id: Id, pinned: z.boolean() }))
    .output(Activity),
  noteVersions: base
    .route({
      method: 'GET',
      path: '/activities/notes/{id}/versions',
      summary: "A note's earlier wordings, newest first (the latest 100)",
    })
    .input(z.object({ id: Id }))
    .output(z.object({ data: z.array(NoteVersion).max(100) })),
  removeNote: base
    .route({
      method: 'DELETE',
      path: '/activities/notes/{id}',
      summary: 'Delete a note (its author, owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  create: base
    .route({
      method: 'POST',
      path: '/activities',
      successStatus: 201,
      summary:
        'Add to a customer’s or company’s timeline (plugins only). 404 when the record does not exist',
    })
    .input(ActivityInput)
    .output(z.object({ activity: Activity, created: z.boolean() })),
  update: base
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
  remove: base
    .route({
      method: 'DELETE',
      path: '/activities/{id}',
      summary: "Remove a plugin's own entry (by id or `key:<dedupeKey>`)",
    })
    .input(z.object({ id: z.string().min(1).max(260) }))
    .output(z.object({ ok: z.literal(true) })),
};
