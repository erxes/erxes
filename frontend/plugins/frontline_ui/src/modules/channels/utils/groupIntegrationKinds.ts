import type { TIntegrationEntry } from '@/integrations/hooks/useIntegrationEntries';

export type TChannelIntegrationKind = TIntegrationEntry & {
  count: number;
  needsAttention: boolean;
};

type TChannelIntegrationSummary = {
  kind: string;
  healthStatus?: { status?: string | null } | null;
};

export const groupIntegrationKinds = (
  entries: TIntegrationEntry[],
  integrations: TChannelIntegrationSummary[],
  needsAttention: (status?: string | null) => boolean,
) => {
  const stats = new Map<string, { count: number; broken: boolean }>();

  for (const { kind, healthStatus } of integrations) {
    const current = stats.get(kind) ?? { count: 0, broken: false };
    stats.set(kind, {
      count: current.count + 1,
      broken: current.broken || needsAttention(healthStatus?.status),
    });
  }

  const connected: TChannelIntegrationKind[] = [];
  const available: TChannelIntegrationKind[] = [];

  for (const entry of entries) {
    const stat = stats.get(entry.type);
    const target = stat ? connected : available;
    target.push({
      ...entry,
      count: stat?.count ?? 0,
      needsAttention: stat?.broken ?? false,
    });
  }

  return { connected, available };
};
