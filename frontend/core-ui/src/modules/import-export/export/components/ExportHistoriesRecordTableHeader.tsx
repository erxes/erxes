import { IconFileExport } from '@tabler/icons-react';
import { Badge, Select, Skeleton } from 'erxes-ui';
import { useExportHistoriesRecordTableHeader } from '../hooks/useExportHistoriesRecordTableHeader';
import { useTranslation } from 'react-i18next';

export const ExportHistoriesRecordTableHeader = () => {
  const { t } = useTranslation('import-export');
  const {
    selectedEntityType,
    setSelectedEntityType,
    contentTypes,
    typesLoading,
    totalLabel,
    selectedTypeLabel,
    isLoadingTotalCount,
    hasContentTypes,
    isFilterNotAvailable,
  } = useExportHistoriesRecordTableHeader();

  return (
    <div className="rounded-xl border bg-muted/20 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <IconFileExport className="size-4" />
            </div>
            <h3 className="text-base font-semibold">{t('export-history', 'Export history')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('export-history-description', 'Review generated CSV files, track progress, and download completed exports again whenever you need them.')}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{selectedTypeLabel}</Badge>
            {hasContentTypes && (
              <Badge variant="secondary">
                {t('supported-records', '{{total}} supported records', { total: contentTypes.length.toLocaleString() })}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-56 lg:items-end">
          <div className="text-muted-foreground text-sm whitespace-nowrap">
            {isLoadingTotalCount ? (
              <Skeleton className="h-5 w-28" />
            ) : (
              totalLabel
            )}
          </div>
          {typesLoading && <Skeleton className="h-9 w-full lg:w-56" />}
          {hasContentTypes && (
            <Select
              value={selectedEntityType}
              onValueChange={setSelectedEntityType}
            >
              <Select.Trigger className="w-full lg:w-56">
                <Select.Value placeholder={t('filter-by-type', 'Filter by type')} />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">{t('all-types', 'All types')}</Select.Item>
                {contentTypes.map((type) => (
                  <Select.Item key={type.contentType} value={type.contentType}>
                    {type.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          )}
          {isFilterNotAvailable && (
            <p className="text-xs text-muted-foreground">
              {t('type-filters-unavailable', 'Type filters are temporarily unavailable.')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
