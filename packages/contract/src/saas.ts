import { oc } from '@orpc/contract';
import { z } from 'zod';

/** erxes.io's plugin tiers: Free is never billed; Plus and Pro have their own monthly prices. */
export const PluginTier = z.enum(['free', 'plus', 'pro']);

export type PluginTier = z.infer<typeof PluginTier>;

/** A plugin's billing status on erxes.io: `past_due` while Stripe retries, `canceling` until the period ends. */
export const EntitlementStatus = z.enum(['active', 'past_due', 'canceling']);

/**
 * What a plugin may do here: `full`; `warning` (payment retrying or ending
 * at period end — everything still works); `read_only` (it left the plan:
 * reads and exports for the grace period); `off` (not in the plan).
 */
export const PluginAccess = z.enum(['full', 'warning', 'read_only', 'off']);

export type PluginAccess = z.infer<typeof PluginAccess>;

export const OrganizationStatus = z.enum(['active', 'suspended', 'inactive']);

/**
 * erxes.io → core: create (or rename, or enable/disable) an organisation's
 * workspace. `PUT /core/v1/saas/organizations/{id}` with
 * `Authorization: Bearer <SAAS_PLATFORM_TOKEN>`. Plugins and tiers are not
 * sent: core reads them from erxes.io's entitlement API.
 */
export const SaasWorkspace = z.object({
  organization: z.object({
    subdomain: z.string().trim().toLowerCase().max(63),
    name: z.string().trim().min(1).max(100),
  }),
  /** The owner, when the workspace is new here (signs in through erxes.io's hand-off). */
  owner: z
    .object({
      email: z.string().trim().email().max(254),
      fullName: z.string().trim().max(200).optional(),
    })
    .optional(),
  status: OrganizationStatus.optional(),
});

export type SaasWorkspace = z.infer<typeof SaasWorkspace>;

export const SubscriptionInfo = z.object({
  /** False on self-hosted installations: every plugin, no tiers. */
  saas: z.boolean(),
  organizationStatus: OrganizationStatus,
  plugins: z.array(
    z.object({
      code: z.string(),
      title: z.string(),
      tier: PluginTier.nullable(),
      status: EntitlementStatus.nullable(),
      access: PluginAccess,
      /** Read-only until then, then off (if it isn't bought again). */
      readOnlyUntil: z.string().datetime().nullable(),
      installed: z.boolean(),
    }),
  ),
  /** Where the owner manages the subscription (erxes.io). */
  manageUrl: z.string().nullable(),
  /** When erxes.io was last asked. */
  checkedAt: z.string().datetime().nullable(),
});

export type SubscriptionInfo = z.infer<typeof SubscriptionInfo>;

/** For a plugin: its tier here (gate Plus/Pro features with it) and what it may do. Self-hosted: `pro`, `full`. */
export const PluginPlan = z.object({
  saas: z.boolean(),
  tier: PluginTier.nullable(),
  status: EntitlementStatus.nullable(),
  access: PluginAccess,
  readOnlyUntil: z.string().datetime().nullable(),
});

export type PluginPlan = z.infer<typeof PluginPlan>;

export const saasContract = {
  plan: oc
    .route({
      method: 'GET',
      path: '/plan',
      summary: "The organisation's subscription: each plugin's tier, status and access",
    })
    .output(SubscriptionInfo),
  pluginPlan: oc
    .route({
      method: 'GET',
      path: '/plan/plugin',
      summary: 'For the calling plugin: its tier and what it may do (read-only, off)',
    })
    .output(PluginPlan),
};
