import { useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IMPORT_COLUMN_PREVIEW } from '../../graphql/import/importsQueries';
import {
  TImportColumnPreview,
  TImportPreviewColumn,
  TImportPreviewField,
  TPendingImportUpload,
} from '../../types/import/importTypes';
import { useImport } from './useImport';

export const IGNORE_COLUMN = '__ignore__';

type ImportColumnPreviewResponse = {
  importColumnPreview: TImportColumnPreview;
};

/** Column index → target field key, or IGNORE_COLUMN when left out. */
type ColumnSelection = Record<number, string>;

const seedSelection = (columns: TImportPreviewColumn[]): ColumnSelection =>
  columns.reduce<ColumnSelection>((selection, column) => {
    // A suggestion is shown pre-filled but still counts as unconfirmed, so
    // the user sees what will happen before pressing start.
    selection[column.index] = column.key || IGNORE_COLUMN;
    return selection;
  }, {});

export const useImportColumnMapping = ({
  entityType,
  pendingUpload,
  onFinished,
}: {
  entityType: string;
  pendingUpload: TPendingImportUpload | null;
  onFinished: () => void;
}) => {
  const { t } = useTranslation('importExport');
  const [selection, setSelection] = useState<ColumnSelection>({});
  const [isStarting, setIsStarting] = useState(false);
  const { startImport } = useImport(entityType);

  const { data, loading, error } = useQuery<ImportColumnPreviewResponse>(
    IMPORT_COLUMN_PREVIEW,
    {
      variables: {
        entityType,
        fileKey: pendingUpload?.fileKey,
        fileName: pendingUpload?.fileName,
      },
      skip: !pendingUpload,
      fetchPolicy: 'network-only',
    },
  );

  const preview = data?.importColumnPreview;
  const columns = useMemo(() => preview?.columns || [], [preview]);
  const fields = useMemo(() => preview?.fields || [], [preview]);

  useEffect(() => {
    setSelection(seedSelection(columns));
  }, [columns]);

  const fieldByKey = useMemo(
    () =>
      fields.reduce<Record<string, TImportPreviewField>>((map, field) => {
        map[field.key] = field;
        return map;
      }, {}),
    [fields],
  );

  const duplicateKeys = useMemo(() => {
    const seen = new Map<string, number>();

    Object.values(selection).forEach((key) => {
      if (key === IGNORE_COLUMN) return;
      seen.set(key, (seen.get(key) || 0) + 1);
    });

    return new Set(
      [...seen.entries()].filter(([, count]) => count > 1).map(([key]) => key),
    );
  }, [selection]);

  const mappedCount = useMemo(
    () =>
      Object.values(selection).filter((key) => key !== IGNORE_COLUMN).length,
    [selection],
  );

  const missingRequiredFields = useMemo(() => {
    const chosen = new Set(Object.values(selection));

    return fields.filter((field) => field.required && !chosen.has(field.key));
  }, [fields, selection]);

  const selectColumn = useCallback((index: number, key: string) => {
    setSelection((current) => ({ ...current, [index]: key }));
  }, []);

  const resetToSuggestions = useCallback(() => {
    setSelection(seedSelection(columns));
  }, [columns]);

  const canStart =
    !!pendingUpload &&
    !loading &&
    !error &&
    !isStarting &&
    mappedCount > 0 &&
    !duplicateKeys.size &&
    !missingRequiredFields.length;

  const handleStart = useCallback(async () => {
    if (!pendingUpload || !canStart) {
      return;
    }

    setIsStarting(true);

    try {
      await startImport(
        entityType,
        pendingUpload.fileKey,
        pendingUpload.fileName,
        columns
          .filter((column) => selection[column.index] !== IGNORE_COLUMN)
          .map((column) => ({
            index: column.index,
            header: column.header,
            key: selection[column.index],
          })),
      );

      toast({
        title: t('import-started'),
        description: t('import-started-description', {
          fileName: pendingUpload.fileName,
          total: mappedCount,
        }),
      });

      onFinished();
    } catch (startError: unknown) {
      toast({
        title: t('import-start-failed'),
        description:
          startError instanceof Error
            ? startError.message
            : t('import-start-failed'),
        variant: 'destructive',
      });
    } finally {
      setIsStarting(false);
    }
  }, [
    canStart,
    columns,
    entityType,
    mappedCount,
    onFinished,
    pendingUpload,
    selection,
    startImport,
    t,
  ]);

  return {
    columns,
    fields,
    fieldByKey,
    selection,
    selectColumn,
    resetToSuggestions,
    duplicateKeys,
    missingRequiredFields,
    mappedCount,
    ignoredCount: columns.length - mappedCount,
    totalRows: preview?.totalRows || 0,
    loading,
    error,
    isStarting,
    canStart,
    handleStart,
  };
};
