import { useChannelIntegrationsPeek } from '@/channels/hooks/useChannelIntegrationsPeek';
import { groupIntegrationKinds } from '@/channels/utils/groupIntegrationKinds';
import { useIntegrationEntries } from '@/integrations/hooks/useIntegrationEntries';
import { useMemo } from 'react';

export const useChannelIntegrationKinds = (channelId: string) => {
  const entries = useIntegrationEntries();
  const { integrations, totalCount, loading, error, needsAttention } =
    useChannelIntegrationsPeek(channelId);

  const { connected, available } = useMemo(
    () => groupIntegrationKinds(entries, integrations, needsAttention),
    [entries, integrations, needsAttention],
  );

  return {
    connected,
    available,
    totalKinds: entries.length,
    partialCount: totalCount > integrations.length ? integrations.length : 0,
    loading,
    error,
  };
};
