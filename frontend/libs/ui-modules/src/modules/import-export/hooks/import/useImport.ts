import { useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ACTIVE_IMPORTS } from '../../graphql/import/importsQueries';
import {
  START_IMPORT,
  CANCEL_IMPORT,
  RETRY_IMPORT,
  RESUME_IMPORT,
} from '../../graphql/import/importMutations';
import { TImportProgress } from '../../types/import/importTypes';

export const useImport = (entityType?: string) => {
  const { data, refetch, startPolling, stopPolling } = useQuery(
    GET_ACTIVE_IMPORTS,
    {
      fetchPolicy: 'network-only',
      variables: { entityType },
    },
  );

  const activeImports: TImportProgress[] = data?.activeImports || [];

  const hasActiveImports = useMemo(() => {
    if (!data) return false;
    return activeImports.some((importItem) =>
      ['processing', 'validating', 'pending'].includes(importItem.status),
    );
  }, [activeImports, data]);

  useEffect(() => {
    if (hasActiveImports) {
      startPolling(2000);
      return () => {
        stopPolling();
      };
    } else {
      stopPolling();
    }
  }, [hasActiveImports, startPolling, stopPolling]);

  // Always refetch when data changes to ensure latest imports are shown
  useEffect(() => {
    if (data) {
      const hasActive = activeImports.some((importItem) =>
        ['processing', 'validating', 'pending'].includes(importItem.status),
      );
      if (hasActive && !hasActiveImports) {
        // If we have active imports but polling wasn't started, start it
        startPolling(2000);
      }
    }
  }, [data, activeImports, hasActiveImports, startPolling]);

  const [startImportMutation, { loading: startLoading }] = useMutation(
    START_IMPORT,
    {
      refetchQueries: [
        { query: GET_ACTIVE_IMPORTS, variables: { entityType } },
      ],
      awaitRefetchQueries: true,
    },
  );

  const [cancelImportMutation, { loading: cancelLoading }] = useMutation(
    CANCEL_IMPORT,
    {
      refetchQueries: [{ query: GET_ACTIVE_IMPORTS }],
    },
  );

  const [retryImportMutation, { loading: retryLoading }] = useMutation(
    RETRY_IMPORT,
    {
      refetchQueries: [{ query: GET_ACTIVE_IMPORTS }],
    },
  );

  const [resumeImportMutation, { loading: resumeLoading }] = useMutation(
    RESUME_IMPORT,
    {
      refetchQueries: [{ query: GET_ACTIVE_IMPORTS }],
    },
  );

  const startImport = useCallback(
    async (entityType: string, fileKey: string, fileName: string) => {
      try {
        const result = await startImportMutation({
          variables: {
            entityType,
            fileKey,
            fileName,
          },
        });
        // Ensure immediate refetch and start polling
        await refetch();
        startPolling(2000);
        return result.data?.importStart;
      } catch (error) {
        throw error;
      }
    },
    [startImportMutation, refetch, startPolling],
  );

  const cancelImport = useCallback(
    async (importId: string) => {
      try {
        const result = await cancelImportMutation({
          variables: { importId },
        });
        return result.data?.importCancel;
      } catch (error) {
        throw error;
      }
    },
    [cancelImportMutation],
  );

  const retryImport = useCallback(
    async (importId: string) => {
      try {
        const result = await retryImportMutation({
          variables: { importId },
        });
        return result.data?.importRetry;
      } catch (error) {
        throw error;
      }
    },
    [retryImportMutation],
  );

  const resumeImport = useCallback(
    async (importId: string) => {
      try {
        const result = await resumeImportMutation({
          variables: { importId },
        });
        return result.data?.importResume;
      } catch (error) {
        throw error;
      }
    },
    [resumeImportMutation],
  );

  return {
    activeImports,
    startImport,
    cancelImport,
    retryImport,
    resumeImport,
    fetchActiveImports: refetch,
    loading: startLoading || cancelLoading || retryLoading || resumeLoading,
  };
};
