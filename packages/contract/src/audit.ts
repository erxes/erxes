import { oc } from '@orpc/contract';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, Id } from './common';
import { ActorRef } from './platform';

export const AuditEntry = z.object({
  id: Id,
  actor: ActorRef,
  /** `<record>.<verb>`: `customer.deleted`, `user.role_changed`, `auth.signed_in`. */
  action: z.string(),
  targetType: z.string().nullable(),
  targetId: z.string().nullable(),
  targetLabel: z.string().nullable(),
  /** `{ field: [before, after] }` */
  changes: z.record(z.tuple([z.unknown(), z.unknown()])).nullable(),
  metadata: z.record(z.unknown()).nullable(),
  ip: z.string().nullable(),
  userAgent: z.string().nullable(),
  /** `core` or the plugin that recorded it. */
  source: z.string(),
  createdAt: z.string().datetime(),
});
export type AuditEntry = z.infer<typeof AuditEntry>;

/** Who changed what in core (owners and admins). */
export const AuditStreamFormat = z.enum(['erxes', 'datadog', 'splunk']);

const StreamUrl = z
  .string()
  .trim()
  .url()
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

export const AuditStream = z.object({
  id: Id,
  name: z.string(),
  url: z.string(),
  format: AuditStreamFormat,
  status: z.enum(['active', 'paused']),
  authHeaderName: z.string().nullable(),
  /** The last chain position delivered, and how many entries wait. */
  cursorSeq: z.number().int(),
  pending: z.number().int(),
  lastDeliveredAt: z.string().datetime().nullable(),
  lastError: z.string().nullable(),
  consecutiveFailures: z.number().int(),
  createdAt: z.string().datetime(),
});
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
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
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
              changes: z.record(z.tuple([z.unknown(), z.unknown()])).optional(),
              metadata: z.record(z.unknown()).optional(),
              /** The end user's address and browser, if the plugin knows them. */
              ip: z.string().trim().max(64).optional(),
              userAgent: z.string().trim().max(500).optional(),
            }),
          )
          .min(1)
          .max(100),
      }),
    )
    .output(z.object({ recorded: z.number().int() })),
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
        checked: z.number().int(),
        /** The first entry (chain position) where the chain breaks. */
        brokenAt: z.number().int().nullable(),
        /**
         * Signed checkpoints (core's key, outside the database): they catch a
         * chain rewritten consistently and entries removed from its end.
         */
        checkpoints: z.object({
          checked: z.number().int(),
          latestSeq: z.number().int().nullable(),
          latestAt: z.string().datetime().nullable(),
          /** The first checkpoint the log no longer matches. */
          mismatchAt: z.number().int().nullable(),
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
        data: z.array(
          z.object({
            chainSeq: z.number().int(),
            hash: z.string(),
            keyId: z.string(),
            signature: z.string(),
            createdAt: z.string().datetime(),
          }),
        ),
      }),
    ),
  settings: oc
    .route({
      method: 'GET',
      path: '/settings/audit',
      summary: 'How long the audit log keeps entries',
    })
    .output(z.object({ retentionDays: z.number().int(), maxRetentionDays: z.number().int() })),
  updateSettings: oc
    .route({ method: 'PUT', path: '/settings/audit', summary: 'Change audit retention (owners)' })
    .input(z.object({ retentionDays: z.number().int().min(30).max(3650) }))
    .output(z.object({ retentionDays: z.number().int(), maxRetentionDays: z.number().int() })),
  streams: oc
    .route({
      method: 'GET',
      path: '/audit/streams',
      summary: 'Where the audit log is streamed (owners)',
    })
    .output(z.object({ data: z.array(AuditStream) })),
  createStream: oc
    .route({
      method: 'POST',
      path: '/audit/streams',
      successStatus: 201,
      summary: 'Stream the audit log to a log service; the signing secret is shown once',
    })
    .input(
      z.object({
        name: z.string().trim().min(1).max(80),
        url: StreamUrl,
        format: AuditStreamFormat.default('erxes'),
        authHeader: AuthHeader.optional(),
        /** `now`: entries from here on; `beginning`: everything still kept, then new ones. */
        from: z.enum(['now', 'beginning']).default('now'),
      }),
    )
    .output(z.object({ stream: AuditStream, secret: z.string() })),
  updateStream: oc
    .route({ method: 'PATCH', path: '/audit/streams/{id}' })
    .input(
      z.object({
        id: Id,
        name: z.string().trim().min(1).max(80).optional(),
        url: StreamUrl.optional(),
        format: AuditStreamFormat.optional(),
        authHeader: AuthHeader.nullable().optional(),
        status: z.enum(['active', 'paused']).optional(),
      }),
    )
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
        status: z.number().int().nullable(),
        body: z.string().nullable(),
        error: z.string().nullable(),
        ms: z.number().nullable(),
      }),
    ),
};
