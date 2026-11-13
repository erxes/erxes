import type { EntitledPlugin } from '@erxes/core-db';
import { z } from 'zod';
import { config } from '~/config';
import type { EntitlementRow } from './access';

/** One plugin in erxes.io's answer; entries with an unknown code or tier are left out. */
const Entitled = z.object({
  code: z.string(),
  tier: z.enum(['free', 'plus', 'pro']),
  status: z.enum(['active', 'past_due', 'canceling']).catch('active'),
});

/** erxes.io's answer: `details` per plugin, or the older `plugins` (code → tier). */
const PlatformAnswer = z.object({
  status: z.unknown(),
  details: z.array(z.unknown()).optional(),
  plugins: z.record(z.string(), z.unknown()).optional(),
});

export interface PlatformEntitlements {
  orgStatus: EntitlementRow['orgStatus'];
  plugins: EntitledPlugin[];
}

/** `GET <platform>/api/platform/organizations/plugins?subdomain=` (Bearer), 10 s at most. */
export const askPlatform = async (subdomain: string): Promise<PlatformEntitlements | null> => {
  const response = await fetch(
    `${config.saas.platformUrl}/api/platform/organizations/plugins?subdomain=${encodeURIComponent(subdomain)}`,
    {
      headers: { authorization: `Bearer ${config.saas.platformToken}`, accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) throw new Error(`erxes.io answered ${response.status}`);

  const body = PlatformAnswer.parse(await response.json());

  const details =
    body.details ??
    Object.entries(body.plugins ?? {}).map(([code, tier]) => ({ code, tier, status: 'active' }));

  return {
    orgStatus: body.status === 'suspended' || body.status === 'inactive' ? body.status : 'active',
    plugins: details.flatMap((item) => {
      const entry = Entitled.safeParse(item);

      return entry.success ? [entry.data] : [];
    }),
  };
};
