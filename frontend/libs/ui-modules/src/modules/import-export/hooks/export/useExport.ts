import { useMutation } from '@apollo/client';
import { useCallback } from 'react';
import { START_EXPORT } from '../../graphql/export/exportMutations';
import { GET_ACTIVE_EXPORTS } from '../../graphql/export/exportQueries';
import { toast, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('importExport');
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
        filters?: Record<string, any>;
        ids?: string[];
        selectedFields?: string[];
      },
    ) => {
      const result = await startExportMutation({
        variables: {
          entityType,
          filters: options?.filters,
          ids: options?.ids,
          selectedFields: options?.selectedFields,
        },
      });
      return result.data?.exportStart;
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
        filters,
        ids: exportIds,
        selectedFields,
      })
        .then(() =>
          toast({
            title: t('export-started'),
            description: t('export-started-description'),
          }),
        )
        .catch((error: Error) =>
          toast({
            title: t('export-failed'),
            description: error.message || t('export-failed'),
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
