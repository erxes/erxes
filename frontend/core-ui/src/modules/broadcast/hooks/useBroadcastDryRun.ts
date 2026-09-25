import { BROADCAST_EMAIL_DRY_RUN } from '@/broadcast/graphql/queries';
import { useLazyQuery } from '@apollo/client';
import { useEffect } from 'react';

export type TBroadcastDryRun = {
  sampled: number;
  fields: { id: string; filled: number; missing: number }[];
  unresolved: string[];
  sampleTo?: string;
  sampleHtml?: string;
};

const SAMPLE_SIZE = 20;

/**
 * Asks what the campaign would produce for a handful of its real recipients,
 * each time the rehearsal is opened. Nothing is sent, so it is safe to run on
 * a live campaign.
 */
export const useBroadcastDryRun = (campaignId: string, open: boolean) => {
  const [run, { data, loading, error, refetch }] = useLazyQuery<{
    broadcastEmailDryRun: TBroadcastDryRun;
  }>(BROADCAST_EMAIL_DRY_RUN, { fetchPolicy: 'network-only' });

  useEffect(() => {
    if (open) {
      run({ variables: { _id: campaignId, sampleSize: SAMPLE_SIZE } });
    }
  }, [open, campaignId, run]);

  return {
    dryRun: data?.broadcastEmailDryRun,
    loading,
    error,
    rerun: () => refetch(),
  };
};
