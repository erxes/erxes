import { useApolloClient } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TImportProgress } from '../../types/import/importTypes';

const FINISHED_STATUSES: TImportProgress['status'][] = [
  'completed',
  'failed',
  'cancelled',
];

type Translate = (key: string, options?: Record<string, unknown>) => string;

const describe = (importItem: TImportProgress, t: Translate): string => {
  const success = importItem.successRows || 0;
  const errors = importItem.errorRows || 0;

  if (importItem.status !== 'completed') {
    return t('import-stopped-description', {
      fileName: importItem.fileName,
      total: success.toLocaleString(),
    });
  }

  return errors > 0
    ? t('import-completed-with-errors', {
        total: success.toLocaleString(),
        errors: errors.toLocaleString(),
      })
    : t('import-completed-description', { total: success.toLocaleString() });
};

/**
 * Announce imports that finish while the user is on the page and pull the
 * freshly written records into the lists already on screen — an import is a
 * bulk write the surrounding tables cannot see on their own.
 */
export const useImportCompletionEffect = (activeImports: TImportProgress[]) => {
  const { t } = useTranslation('importExport');
  const client = useApolloClient();
  const lastStatusRef = useRef<Record<string, TImportProgress['status']>>({});

  useEffect(() => {
    const justFinished = activeImports.filter((importItem) => {
      const previous = lastStatusRef.current[importItem._id];

      return (
        !!previous &&
        previous !== importItem.status &&
        FINISHED_STATUSES.includes(importItem.status)
      );
    });

    activeImports.forEach((importItem) => {
      lastStatusRef.current[importItem._id] = importItem.status;
    });

    if (!justFinished.length) {
      return;
    }

    const importedRecords = justFinished.reduce(
      (total, importItem) => total + (importItem.successRows || 0),
      0,
    );

    if (importedRecords > 0) {
      client.refetchQueries({ include: 'active' });
    }

    justFinished.forEach((importItem) => {
      const failed = importItem.status !== 'completed';

      toast({
        title: failed
          ? t(`status-${importItem.status}`)
          : t('import-completed'),
        description: describe(importItem, t),
        variant: failed ? 'destructive' : undefined,
      });
    });
  }, [activeImports, client, t]);
};
