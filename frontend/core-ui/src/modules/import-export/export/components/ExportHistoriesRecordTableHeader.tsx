import { formatImportExportEntityTypeLabel } from '@/import-export/shared/formatEntityTypeLabel';
import { IconFileExport } from '@tabler/icons-react';
import { Badge, Select, Skeleton, useQueryState } from 'erxes-ui';
import { useExportHistoriesRecordTable } from './ExportHistoriesContext';

export const ExportHistoriesRecordTableHeader = () => {
  const [selectedEntityType, setSelectedEntityType] = useQueryState<string>(
    'type',
    {
      defaultValue: 'all',
    },
  ) as [string, (value: string | null) => void];

  const { contentTypes, loading, totalCount, typesLoading, typesError } =
    useExportHistoriesRecordTable();

  const totalLabel =
    totalCount === 1
      ? '1 export job'
      : `${totalCount.toLocaleString()} export jobs`;

  const selectedTypeLabel =
    selectedEntityType === 'all'
      ? 'All types'
      : formatImportExportEntityTypeLabel(
          selectedEntityType || 'all',
          contentTypes,
        );

  return (
    <div className="rounded-xl border bg-muted/20 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <IconFileExport className="size-4" />
            </div>
            <h3 className="text-base font-semibold">Export history</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Review generated CSV files, track progress, and download completed
            exports again whenever you need them.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{selectedTypeLabel}</Badge>
            {!!contentTypes.length && (
              <Badge variant="secondary">
                {contentTypes.length.toLocaleString()} supported records
              </Badge>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-56 lg:items-end">
          <div className="text-muted-foreground text-sm whitespace-nowrap">
            {loading && !totalCount ? (
              <Skeleton className="h-5 w-28" />
            ) : (
              totalLabel
            )}
          </div>
          {typesLoading ? (
            <Skeleton className="h-9 w-full lg:w-56" />
          ) : !!contentTypes.length ? (
            <Select
              value={selectedEntityType}
              onValueChange={setSelectedEntityType}
            >
              <Select.Trigger className="w-full lg:w-56">
                <Select.Value placeholder="Filter by type" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All types</Select.Item>
                {contentTypes.map((type) => (
                  <Select.Item key={type.contentType} value={type.contentType}>
                    {type.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          ) : null}
          {!typesLoading && typesError ? (
            <p className="text-xs text-muted-foreground">
              Type filters are temporarily unavailable.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
