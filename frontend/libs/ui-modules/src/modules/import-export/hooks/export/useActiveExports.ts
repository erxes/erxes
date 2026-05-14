import { useMutation, useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo } from 'react';
import { GET_ACTIVE_EXPORTS } from '../../graphql/export/exportQueries';
import { TExportProgress } from '../../types/export/exportTypes';
import {
  CANCEL_EXPORT,
  RETRY_EXPORT,
} from '../../graphql/export/exportMutations';
import { toast } from 'erxes-ui';

export const useActiveExports = ({ entityType }: { entityType: string }) => {
  const { data, loading, refetch, startPolling, stopPolling } = useQuery(
    GET_ACTIVE_EXPORTS,
    {
      fetchPolicy: 'network-only',
      variables: { entityType },
    },
  );

  const activeExports: TExportProgress[] = data?.activeExports || [];

  const hasActiveExports = useMemo(() => {
    if (!data) return false;
    return activeExports.some((exportItem) =>
      ['processing', 'validating', 'pending'].includes(exportItem.status),
    );
  }, [activeExports, data]);

  useEffect(() => {
    if (hasActiveExports) {
      startPolling(2000);
      return () => {
        stopPolling();
      };
    } else {
      stopPolling();
    }
  }, [hasActiveExports, startPolling, stopPolling]);

  // Always refetch when data changes to ensure latest exports are shown
  useEffect(() => {
    if (data) {
      const hasActive = activeExports.some((exportItem) =>
        ['processing', 'validating', 'pending'].includes(exportItem.status),
      );
      if (hasActive && !hasActiveExports) {
        // If we have active exports but polling wasn't started, start it
        startPolling(2000);
      }
    }
  }, [data, activeExports, hasActiveExports, startPolling]);
  const [cancelExportMutation, { loading: cancelLoading }] = useMutation(
    CANCEL_EXPORT,
    {
      refetchQueries: [{ query: GET_ACTIVE_EXPORTS }],
    },
  );

  const [retryExportMutation, { loading: retryLoading }] = useMutation(
    RETRY_EXPORT,
    {
      refetchQueries: [{ query: GET_ACTIVE_EXPORTS }],
    },
  );
  const retryExport = useCallback(
    async (exportId: string) => {
      try {
        const result = await retryExportMutation({
          variables: { exportId },
        });
        return result.data?.exportRetry;
      } catch (error) {
        throw error;
      }
    },
    [retryExportMutation],
  );
  const cancelExport = useCallback(
    async (exportId: string) => {
      try {
        const result = await cancelExportMutation({
          variables: { exportId },
        });
        return result.data?.exportCancel;
      } catch (error) {
        throw error;
      }
    },
    [cancelExportMutation],
  );

  const handleRetry = (exportId: string) => {
    retryExport(exportId)
      .then(() => {
        toast({
          title: 'Export retried',
          description: 'Export has been resumed from the last position.',
        });
      })
      .catch((error: Error) => {
        toast({
          title: 'Retry failed',
          description: error.message || 'Failed to retry export',
          variant: 'destructive',
        });
      });
  };

  return {
    activeExports,
    hasActiveExports,
    refetch,
    startPolling,
    stopPolling,
    handleRetry,
    cancelExport,
    loading: loading || cancelLoading || retryLoading,
  };
};
