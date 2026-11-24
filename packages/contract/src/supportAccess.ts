import { supportVisits } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { COMMON_ERRORS } from './errors';
import { CursorQuery, cursorPageOf, Id, isoDate, listOf } from './common';
import { MemberId } from './records';

/** How long one visit of erxes support lasts, in hours. */
export const SUPPORT_VISIT_HOURS = 4;

export const SupportVisit = createSelectSchema(supportVisits, {
  id: Id,
  endedBy: MemberId.nullable(),
  startedAt: isoDate,
  endsAt: isoDate,
  endedAt: isoDate,
}).pick({
  id: true,
  /** The erxes.io admin who came in. */
  staffName: true,
  staffEmail: true,
  /** Why, in their words. */
  reason: true,
  startedAt: true,
  /** When the visit ends on its own. */
  endsAt: true,
  /** When it ended early; null otherwise. */
  endedAt: true,
  /** The owner who ended it; null when it ended on its own. */
  endedBy: true,
});

export type SupportVisit = z.infer<typeof SupportVisit>;

const SupportAccessSettings = z.object({
  /** erxes support may enter. */
  enabled: z.boolean(),
  /** This deployment takes erxes support at all (SaaS with erxes.io's keys). */
  available: z.boolean(),
});

const base = oc.errors(COMMON_ERRORS);

/**
 * erxes support's visits (SaaS): an erxes.io admin opens the workspace as their own support
 * member, an owner in all but team, roles, API keys and audit settings, for
 * `SUPPORT_VISIT_HOURS`. Owners turn it off, see each visit and end one early.
 */
export const supportAccessContract = {
  settings: base
    .route({
      method: 'GET',
      path: '/settings/support-access',
      summary: 'Get support access',
      description: 'Whether erxes support may enter the workspace (owners)',
    })
    .output(SupportAccessSettings),
  updateSettings: base
    .route({
      method: 'PUT',
      path: '/settings/support-access',
      summary: 'Change support access',
      description:
        'Let erxes support in, or keep them out; off ends every visit in progress (owners)',
    })
    .input(z.object({ enabled: z.boolean() }))
    .output(SupportAccessSettings),
  visits: base
    .route({
      method: 'GET',
      path: '/support-access/visits',
      summary: 'List support visits',
      description: "erxes support's visits to the workspace, newest first (owners)",
    })
    .input(CursorQuery)
    .output(cursorPageOf(SupportVisit)),
  active: base
    .route({
      method: 'GET',
      path: '/support-access/active',
      summary: 'List support visits in progress',
      description:
        'Visits in progress: every one for owners, their own for erxes support, none for other members',
    })
    .output(listOf(SupportVisit)),
  endVisit: base
    .route({
      method: 'POST',
      path: '/support-access/visits/{id}/end',
      summary: 'End a support visit',
      description:
        'Sign erxes support out now; 404 NOT_FOUND when the visit already ended (owners)',
    })
    .input(z.object({ id: Id }))
    .output(SupportVisit),
};
