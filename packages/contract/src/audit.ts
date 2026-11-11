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
  createdAt: z.string().datetime(),
});
export type AuditEntry = z.infer<typeof AuditEntry>;

/** Who changed what in core (owners and admins). */
export const auditContract = {
  list: oc
    .route({ method: 'GET', path: '/audit', summary: 'Audit log, newest first (owners and admins)' })
    .input(
      CursorQuery.extend({
        /** An action, or a prefix ending in `.` or `*` (`customer.`, `field*`). */
        action: z.string().trim().max(100).optional(),
        actorId: z.string().trim().max(64).optional(),
        targetType: z.string().trim().max(64).optional(),
        targetId: Id.optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
      }),
    )
    .output(cursorPageOf(AuditEntry)),
};
