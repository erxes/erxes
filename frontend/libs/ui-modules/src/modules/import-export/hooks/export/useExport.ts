import { useMutation } from '@apollo/client';
import { useCallback } from 'react';
import { START_EXPORT } from '../../graphql/export/exportMutations';
import { GET_ACTIVE_EXPORTS } from '../../graphql/export/exportQueries';
import { toast, useConfirm } from 'erxes-ui';

export const useExport = ({
  entityType,
  ids,
  getFilters,
  confirmMessage,
}: {
  entityType: string;
  ids?: string[];
  getFilters?: () => Record<string, any>;
  confirmMessage: string;
}) => {
  const { confirm } = useConfirm();

  const [startExportMutation, { loading: startLoading }] = useMutation(
    START_EXPORT,
    {
      refetchQueries: [
        { query: GET_ACTIVE_EXPORTS, variables: { entityType } },
      ],
      awaitRefetchQueries: true,
    },
  );

  const startExport = useCallback(
    async (
      entityType: string,
      options?: {
        fileFormat?: 'csv' | 'xlsx';
        filters?: Record<string, any>;
        ids?: string[];
        selectedFields?: string[];
      },
    ) => {
      try {
        const result = await startExportMutation({
          variables: {
            entityType,
            fileFormat: options?.fileFormat || 'csv',
            filters: options?.filters,
            ids: options?.ids,
            selectedFields: options?.selectedFields,
          },
        });
        return result.data?.exportStart;
      } catch (error) {
        throw error;
      }
    },
    [startExportMutation],
  );

  const onFieldSelectionConfirm = (selectedFields: string[]) => {
    // If ids exist, export only selected rows
    // Otherwise, get filters from parent component for filtered export
    const filters =
      ids && ids.length > 0 ? undefined : getFilters ? getFilters() : undefined;
    const exportIds = ids && ids.length > 0 ? ids : undefined;

    confirm({ message: confirmMessage }).then(() =>
      startExport(entityType, {
        fileFormat: 'csv',
        filters,
        ids: exportIds,
        selectedFields,
      })
        .then(() =>
          toast({
            title: 'Export started',
            description:
              'Your export has been started. You will be notified when it is ready.',
          }),
        )
        .catch((error: Error) =>
          toast({
            title: 'Export failed',
            description: error.message || 'Failed to start export',
            variant: 'destructive',
          }),
        ),
    );
  };

  return {
    startExport,
    loading: startLoading,
    onFieldSelectionConfirm,
  };
};
