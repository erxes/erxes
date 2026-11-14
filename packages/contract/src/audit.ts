import { AUDIT_STREAM_STARTS } from '@erxes/core-db/enums';
import { auditLogs, auditStreams } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { AuditStreamFormat } from './values';
import { cursorPageOf, CursorQuery, Id, isoDate, listOf } from './common';

export const AuditEntry = createSelectSchema(auditLogs, {
  id: Id,
  changes: () => z.record(z.string(), z.tuple([z.unknown(), z.unknown()])),
  metadata: () => z.record(z.string(), z.unknown()),
  createdAt: isoDate,
}).pick({
  id: true,
  /** A team member (`actorId` = user id), a plugin (its name) or `system`. */
  actorType: true,
  actorId: true,
  /** `<record>.<verb>`: `customer.deleted`, `user.role_changed`, `auth.signed_in`. */
  action: true,
  targetType: true,
  targetId: true,
  targetLabel: true,
  /** `{ field: [before, after] }` */
  changes: true,
  metadata: true,
  ip: true,
  userAgent: true,
  /** `core` or the plugin that recorded it. */
  source: true,
  createdAt: true,
});

export type AuditEntry = z.infer<typeof AuditEntry>;

const StreamUrl = z
  .string()
  .trim()
  .check(z.url())
  .max(2000)
  .refine((value) => /^https?:\/\//.test(value), 'an http(s) address');

/** A header the log service needs (`DD-API-KEY`, `Authorization: Splunk …`); its value is write-only. */
const AuthHeader = z.object({
  name: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9-]{1,60}$/, 'letters, digits and dashes'),
  value: z.string().trim().min(1).max(1000),
});

export const AuditStream = createSelectSchema(auditStreams, {
  id: Id,
  cursorSeq: () => z.int(),
  consecutiveFailures: () => z.int(),
  lastDeliveredAt: isoDate,
  createdAt: isoDate,
})
  .pick({
    id: true,
    name: true,
    url: true,
    format: true,
    status: true,
    authHeaderName: true,
    /** The last chain position delivered. */
    cursorSeq: true,
    lastDeliveredAt: true,
    lastError: true,
    consecutiveFailures: true,
    createdAt: true,
  })
  .extend({
    /** How many entries wait. */
    pending: z.int(),
  });

const StreamFields = createUpdateSchema(auditStreams, {
  name: (name) => name.trim().min(1).max(80),
  url: () => StreamUrl,
}).pick({ name: true, url: true, format: true, status: true });

export type AuditStream = z.infer<typeof AuditStream>;

export const auditContract = {
  list: oc
    .route({
      method: 'GET',
      path: '/audit',
      summary: 'Audit log, newest first (owners and admins)',
    })
    .input(
      CursorQuery.extend({
        /** An action, or a prefix ending in `.` or `*` (`customer.`, `field*`). */
        action: z.string().trim().max(100).optional(),
        actorId: z.string().trim().max(64).optional(),
        targetType: z.string().trim().max(64).optional(),
        targetId: Id.optional(),
        from: z.iso.datetime().optional(),
        to: z.iso.datetime().optional(),
        /** `core` or a plugin. */
        source: z.string().trim().max(40).optional(),
        ip: z.string().trim().max(64).optional(),
        /** Words in the action, record name or id. */
        q: z.string().trim().max(100).optional(),
      }),
    )
    .output(
      cursorPageOf(AuditEntry).extend({
        /** `totalCount` stopped counting at this many. */
        totalCapped: z.boolean(),
      }),
    ),
  record: oc
    .route({
      method: 'POST',
      path: '/audit',
      successStatus: 201,
      summary:
        'Record audit entries (plugins only, up to 100). Actions start with the plugin name. Plugins on core’s database can use `core_record_audit()` in their own transaction instead',
    })
    .input(
      z.object({
        entries: z
          .array(
            z.object({
              action: z
                .string()
                .trim()
                .max(100)
                .regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, 'dotted lower-case name'),
              actorUserId: Id.optional(),
              targetType: z.string().trim().max(64).optional(),
              targetId: z.string().trim().max(64).optional(),
              targetLabel: z.string().trim().max(300).optional(),
              changes: z.record(z.string(), z.tuple([z.unknown(), z.unknown()])).optional(),
              metadata: z.record(z.string(), z.unknown()).optional(),
              /** The end user's address and browser, if the plugin knows them. */
              ip: z.string().trim().max(64).optional(),
              userAgent: z.string().trim().max(500).optional(),
            }),
          )
          .min(1)
          .max(100),
      }),
    )
    .output(z.object({ recorded: z.int() })),
  verify: oc
    .route({
      method: 'GET',
      path: '/audit/verify',
      summary:
        'Check the audit log’s hash chain: has any entry been changed or removed? (owners and admins)',
    })
    .output(
      z.object({
        ok: z.boolean(),
        checked: z.int(),
        /** The first entry (chain position) where the chain breaks. */
        brokenAt: z.int().nullable(),
        /**
         * Signed checkpoints (core's key, outside the database): they catch a
         * chain rewritten consistently and entries removed from its end.
         */
        checkpoints: z.object({
          checked: z.int(),
          latestSeq: z.int().nullable(),
          latestAt: z.iso.datetime().nullable(),
          /** The first checkpoint the log no longer matches. */
          mismatchAt: z.int().nullable(),
        }),
      }),
    ),
  checkpoints: oc
    .route({
      method: 'GET',
      path: '/audit/checkpoints',
      summary:
        'Signed checkpoints of the audit chain (JWS, ES256; keys at /core/v1/.well-known/jwks.json), to keep outside erxes (owners and admins)',
    })
    .input(
      z.object({
        after: z.coerce.number().int().min(0).optional(),
        limit: z.coerce.number().int().min(1).max(1000).default(200),
      }),
    )
    .output(
      z.object({
        // One page: at most `limit`.
        data: z
          .array(
            z.object({
              chainSeq: z.int(),
              hash: z.string(),
              keyId: z.string(),
              signature: z.string(),
              createdAt: isoDate(),
            }),
          )
          .max(1000),
      }),
    ),
  settings: oc
    .route({
      method: 'GET',
      path: '/settings/audit',
      summary: 'How long the audit log keeps entries',
    })
    .output(z.object({ retentionDays: z.int(), maxRetentionDays: z.int() })),
  updateSettings: oc
    .route({ method: 'PUT', path: '/settings/audit', summary: 'Change audit retention (owners)' })
    .input(z.object({ retentionDays: z.int().min(30).max(3650) }))
    .output(z.object({ retentionDays: z.int(), maxRetentionDays: z.int() })),
  streams: oc
    .route({
      method: 'GET',
      path: '/audit/streams',
      summary: 'Where the audit log is streamed (owners)',
    })
    .output(listOf(AuditStream)),
  createStream: oc
    .route({
      method: 'POST',
      path: '/audit/streams',
      successStatus: 201,
      summary: 'Stream the audit log to a log service; the signing secret is shown once',
    })
    .input(
      StreamFields.omit({ status: true })
        .required({ name: true, url: true })
        .extend({
          format: AuditStreamFormat.default('erxes'),
          authHeader: AuthHeader.optional(),
          /** `now`: entries from here on; `beginning`: everything still kept, then new ones. */
          from: z.enum(AUDIT_STREAM_STARTS).default('now'),
        }),
    )
    .output(z.object({ stream: AuditStream, secret: z.string() })),
  updateStream: oc
    .route({ method: 'PATCH', path: '/audit/streams/{id}' })
    .input(StreamFields.extend({ id: Id, authHeader: AuthHeader.nullable().optional() }))
    .output(AuditStream),
  removeStream: oc
    .route({ method: 'DELETE', path: '/audit/streams/{id}' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  testStream: oc
    .route({
      method: 'POST',
      path: '/audit/streams/{id}/test',
      summary: 'Send one test entry now and report the answer',
    })
    .input(z.object({ id: Id }))
    .output(
      z.object({
        ok: z.boolean(),
        status: z.int().nullable(),
        body: z.string().nullable(),
        error: z.string().nullable(),
        ms: z.number().nullable(),
      }),
    ),
};
