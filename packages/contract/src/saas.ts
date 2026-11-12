import { oc } from '@orpc/contract';
import { z } from 'zod';

export const SubscriptionStatus = z.enum(['trialing', 'active', 'past_due', 'canceled', 'expired']);

/**
 * Where the organisation stands: `ok`; `warning` (payment late, or in the
 * grace period after the plan ended: everything still works); `read_only`
 * (the grace period is over: reads and exports only); `suspended` (nobody
 * gets in until erxes lifts it).
 */
export const Standing = z.enum(['ok', 'warning', 'read_only', 'suspended']);
export type Standing = z.infer<typeof Standing>;

/**
 * The control plane (erxes.io billing) → core: everything an organisation's
 * subscription allows. `PUT /core/v1/saas/organizations/{id}`, signed with
 * `SAAS_SECRET` like webhooks (`Erxes-Signature: t=…,v1=…`). Creates the
 * organisation (with `owner`) the first time. `version` only grows: an older
 * update is ignored.
 */
export const SaasOrganizationUpdate = z.object({
  version: z.number().int().min(1),
  organization: z.object({
    subdomain: z.string().trim().toLowerCase().max(63),
    name: z.string().trim().min(1).max(100),
  }),
  /** The first owner, when the organisation is new here (signs in through the dashboard hand-off). */
  owner: z.object({ email: z.string().trim().email().max(254), fullName: z.string().trim().max(200).optional() }).optional(),
  subscription: z.object({
    plan: z.string().trim().min(1).max(60),
    planName: z.string().trim().max(100).optional(),
    status: SubscriptionStatus,
    currentPeriodEnd: z.string().datetime().nullable().optional(),
    /** Changes keep working until then after an unpaid end (default: 7 days after the period). */
    graceUntil: z.string().datetime().nullable().optional(),
  }),
  suspended: z.boolean().default(false),
  suspendedReason: z.string().trim().max(300).optional(),
  /** Plugins in the plan; `until`: still there until then (removed at period end). */
  plugins: z
    .array(
      z.object({
        name: z.string().regex(/^[a-z][a-z0-9_]{0,39}$/),
        until: z.string().datetime().nullable().optional(),
        limits: z.record(z.number().int().min(0).nullable()).optional(),
      }),
    )
    .max(200),
  /** `teamMembers`, and any others plugins read; null: unlimited. */
  limits: z.record(z.number().int().min(0).nullable()).default({}),
  manageUrl: z.string().url().max(500).optional(),
});
export type SaasOrganizationUpdate = z.infer<typeof SaasOrganizationUpdate>;

export const PlanInfo = z.object({
  /** False on self-hosted installations: no plan, no limits. */
  saas: z.boolean(),
  standing: Standing,
  plan: z.string().nullable(),
  planName: z.string().nullable(),
  status: SubscriptionStatus.nullable(),
  currentPeriodEnd: z.string().datetime().nullable(),
  /** When changes stop working (read-only), if the plan isn't renewed. */
  readOnlyAt: z.string().datetime().nullable(),
  suspendedReason: z.string().nullable(),
  plugins: z.array(z.object({ name: z.string(), title: z.string(), until: z.string().datetime().nullable(), installed: z.boolean() })),
  limits: z.array(z.object({ key: z.string(), limit: z.number().int().nullable(), used: z.number().int().nullable() })),
  manageUrl: z.string().nullable(),
});
export type PlanInfo = z.infer<typeof PlanInfo>;

/** What a plugin may use in this organisation: its own limits (`hr.employees`), and standing. */
export const PluginPlan = z.object({
  saas: z.boolean(),
  standing: Standing,
  plan: z.string().nullable(),
  /** In the plan (always true on self-hosted). */
  included: z.boolean(),
  until: z.string().datetime().nullable(),
  limits: z.record(z.number().int().nullable()),
});
export type PluginPlan = z.infer<typeof PluginPlan>;

export const saasContract = {
  plan: oc
    .route({ method: 'GET', path: '/plan', summary: "The organisation's plan, standing, included plugins and limits with usage" })
    .output(PlanInfo),
  pluginPlan: oc
    .route({ method: 'GET', path: '/plan/plugin', summary: 'For the calling plugin: whether it is in the plan, its limits, and the standing' })
    .output(PluginPlan),
};
