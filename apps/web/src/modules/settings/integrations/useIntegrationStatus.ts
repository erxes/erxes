import { orpc } from '@erxes/core-contract/client';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useCan } from '~/modules/auth/session';
import type { Integration } from './catalog';

/** Connected and working, connected but turned off, connected with something to fix, or not yet. */
type IntegrationState = 'connected' | 'off' | 'attention' | 'not-set-up';

export interface IntegrationStatus {
  state: IntegrationState;
  /** What needs fixing, or how many connections there are. */
  count?: number;
}

/**
 * Each integration's state (`statusOf`), from three queries for the whole
 * catalog. Null while it loads, when its query failed (`error`), or when the
 * member may not see it (gateways and receipts need payments.manage). A
 * plugin's tile has none: core can't tell whether a plugin is set up.
 */
export const useIntegrationStatus = () => {
  const canPayments = useCan()('payments.manage');
  const ebarimt = useQuery(orpc.ebarimt.settings.queryOptions());

  const gateways = useQuery(
    orpc.payments.gateways.queryOptions({ input: canPayments ? undefined : skipToken }),
  );

  const failed = useQuery(
    orpc.ebarimt.receipts.queryOptions({
      input:
        canPayments && ebarimt.data?.status === 'active'
          ? { status: 'failed', limit: 1 }
          : skipToken,
    }),
  );

  const statusOf = (integration: Integration): IntegrationStatus | null => {
    if (integration.kind === 'ebarimt') {
      if (!ebarimt.isSuccess) return null;

      const saved = ebarimt.data;

      if (!saved) return { state: 'not-set-up' };

      if (saved.status !== 'active') return { state: 'off' };

      const count = failed.data?.totalCount ?? 0;

      return count ? { state: 'attention', count } : { state: 'connected' };
    }

    if (integration.kind === 'plugin' || !gateways.data) return null;

    const all = gateways.data.data;

    if (!all.length) return { state: 'not-set-up' };

    const on = all.filter((gateway) => gateway.status === 'active').length;

    return on ? { state: 'connected', count: on } : { state: 'off' };
  };

  return {
    statusOf,
    /** A state query failed: its tiles show no state, the page says so. */
    error: ebarimt.error ?? gateways.error ?? failed.error,
    refetch: () => Promise.all([ebarimt.refetch(), gateways.refetch(), failed.refetch()]),
  };
};
