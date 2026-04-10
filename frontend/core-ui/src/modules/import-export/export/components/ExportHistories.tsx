import { useState } from 'react';
import {
  IconAlertCircle,
  IconDotsVertical,
  IconDownload,
  IconFileExport,
  IconFileText,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  DropdownMenu,
  Empty,
  REACT_APP_API_URL,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Select,
  Skeleton,
  TextOverflowTooltip,
} from 'erxes-ui';
import { TExportProgress } from 'ui-modules';
import { useImportExportTypes } from '~/modules/import-export/hooks/useImportExportTypes';
import { useExportHistories } from '~/modules/import-export/export/hooks/useExportHistories';
import { formatImportExportEntityTypeLabel } from '~/modules/import-export/shared/formatEntityTypeLabel';
import { formatImportExportDuration } from '~/modules/import-export/shared/import-export-duration';

function PieChart({ value }: { value: number }) {
  const size = 20;
  const radius = size / 2 - 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const percentage = normalizedValue / 100;
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        stroke="hsl(var(--muted))"
        strokeWidth="2"
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        stroke="#10b981"
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
          transition: 'stroke-dashoffset 0.3s ease',
        }}
      />
    </svg>
  );
}

function ExportHistoryActionsCell({
  exportItem,
}: {
  exportItem: TExportProgress;
}) {
  const canDownload = exportItem.status === 'completed' && !!exportItem.fileKey;

  if (!canDownload) {
    return (
      <RecordTableInlineCell className="justify-end text-xs text-muted-foreground" />
    );
  }

  function handleDownload() {
    if (!exportItem.fileKey) {
      return;
    }

    const fileUrl = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
      exportItem.fileKey,
    )}`;

    window.open(fileUrl, '_blank');
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <RecordTableInlineCell className="justify-center cursor-pointer">
          <IconDotsVertical className="size-4 text-muted-foreground" />
        </RecordTableInlineCell>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={handleDownload}>
          <IconDownload /> Download file
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

const EXPORT_STATUS_META: Record<
  TExportProgress['status'],
  {
    label: string;
    variant: 'success' | 'destructive' | 'secondary' | 'warning' | 'info';
  }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  validating: { label: 'Validating', variant: 'warning' },
  processing: { label: 'Processing', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
};

const createExportHistoryColumns = (
  labelsByContentType: Record<string, string>,
): ColumnDef<TExportProgress>[] => [
  {
    id: 'fileName',
    accessorKey: 'fileName',
    header: () => <RecordTable.InlineHead label="File" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="max-w-xs gap-2">
        <IconFileText className="size-4 text-muted-foreground flex-shrink-0" />
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'entityType',
    accessorKey: 'entityType',
    header: () => <RecordTable.InlineHead label="Type" />,
    cell: ({ row }) => (
      <RecordTableInlineCell className="whitespace-nowrap">
        <Badge variant="secondary" className="font-normal">
          {formatImportExportEntityTypeLabel(
            row.original.entityType,
            labelsByContentType,
          )}
        </Badge>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const statusMeta =
        EXPORT_STATUS_META[status] || EXPORT_STATUS_META.pending;

      return (
        <RecordTableInlineCell>
          <Badge
            variant={statusMeta.variant}
            className="uppercase tracking-wide text-[11px] px-2 py-0.5"
          >
            {statusMeta.label}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'totalRows',
    accessorKey: 'totalRows',
    header: () => <RecordTable.InlineHead label="Records" />,
    cell: ({ row }) => {
      const totalRows = row.original.totalRows || 0;
      return (
        <RecordTableInlineCell className="justify-end whitespace-nowrap tabular-nums">
          {totalRows.toLocaleString()}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'progress',
    accessorKey: 'progress',
    header: () => <RecordTable.InlineHead label="Progress" />,
    cell: ({ row }) => {
      const progressValue = row.original.progress;
      return (
        <RecordTableInlineCell className="justify-end whitespace-nowrap">
          {typeof progressValue === 'number' ? (
            <div className="flex items-center gap-2">
              <PieChart value={Math.min(Math.max(progressValue, 0), 100)} />
              <span className="text-xs text-muted-foreground tabular-nums">
                {progressValue}%
              </span>
            </div>
          ) : (
            '-'
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead label="Created" />,
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return (
        <RecordTableInlineCell className="whitespace-nowrap">
          {createdAt ? <RelativeDateDisplay.Value value={createdAt} /> : '-'}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'completedAt',
    accessorKey: 'completedAt',
    header: () => <RecordTable.InlineHead label="Completed" />,
    cell: ({ row }) => {
      const { completedAt } = row.original;
      return (
        <RecordTableInlineCell className="whitespace-nowrap">
          {completedAt ? (
            <RelativeDateDisplay.Value value={completedAt} />
          ) : (
            '-'
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'duration',
    header: () => <RecordTable.InlineHead label="Duration" />,
    cell: ({ row }) => {
      const { startedAt, completedAt } =
        row.original || ({} as TExportProgress);

      return (
        <RecordTableInlineCell className="justify-end whitespace-nowrap tabular-nums">
          {startedAt && completedAt
            ? formatImportExportDuration(startedAt, completedAt)
            : '-'}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'actions',
    header: () => <RecordTable.InlineHead label="Actions" />,
    cell: ({ row }) => <ExportHistoryActionsCell exportItem={row.original} />,
    size: 60,
  },
];

export function ExportHistories() {
  const [selectedEntityType, setSelectedEntityType] = useState('all');
  const {
    types,
    labelsByContentType,
    loading: typesLoading,
    error: typesError,
  } = useImportExportTypes({
    operation: 'EXPORT',
  });
  const entityTypes =
    selectedEntityType === 'all' ? undefined : [selectedEntityType];
  const {
    list,
    totalCount,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
  } = useExportHistories({ entityTypes });
  const selectedTypeLabel =
    selectedEntityType === 'all'
      ? 'All types'
      : formatImportExportEntityTypeLabel(
          selectedEntityType,
          labelsByContentType,
        );
  const columns = createExportHistoryColumns(labelsByContentType);

  const totalLabel =
    totalCount === 1
      ? '1 export job'
      : `${totalCount.toLocaleString()} export jobs`;
  const emptyTitle =
    selectedEntityType === 'all'
      ? 'No exports yet'
      : `No ${selectedTypeLabel} exports yet`;
  const emptyDescription =
    selectedEntityType === 'all'
      ? 'CSV exports will appear here after someone downloads records from a module. Completed files can be downloaded again from this page.'
      : `${selectedTypeLabel} exports will appear here after someone downloads records in that section. Completed files can be downloaded again from this page.`;

  if (error) {
    return (
      <Empty className="min-h-[22rem] border border-destructive/30 bg-destructive/5">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle className="text-destructive" />
          </Empty.Media>
          <Empty.Title>Export history couldn&apos;t be loaded</Empty.Title>
          <Empty.Description>
            Try refreshing this page again in a moment.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
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
              {!!types.length && (
                <Badge variant="secondary">
                  {types.length.toLocaleString()} supported records
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
            ) : !!types.length ? (
              <Select
                value={selectedEntityType}
                onValueChange={setSelectedEntityType}
              >
                <Select.Trigger className="w-full lg:w-56">
                  <Select.Value placeholder="Filter by type" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">All types</Select.Item>
                  {types.map((type) => (
                    <Select.Item
                      key={type.contentType}
                      value={type.contentType}
                    >
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

      {!loading && !list.length ? (
        <Empty className="min-h-[24rem] rounded-xl border bg-muted/20">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconFileExport />
            </Empty.Media>
            <Empty.Title>{emptyTitle}</Empty.Title>
            <Empty.Description>{emptyDescription}</Empty.Description>
          </Empty.Header>
          {!!types.length && (
            <Empty.Content>
              <div className="flex flex-wrap justify-center gap-2">
                {types.map((type) => (
                  <Badge key={type.contentType} variant="secondary">
                    {type.label}
                  </Badge>
                ))}
              </div>
            </Empty.Content>
          )}
        </Empty>
      ) : (
        <RecordTable.Provider
          columns={columns}
          data={list}
          className="overflow-hidden rounded-xl border bg-background"
        >
          <RecordTable.CursorProvider
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            dataLength={list.length}
            sessionKey={`export_histories_cursor_${selectedEntityType}`}
          >
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.CursorBackwardSkeleton
                  handleFetchMore={handleFetchMore}
                />
                {loading ? (
                  <RecordTable.RowSkeleton rows={20} />
                ) : (
                  <RecordTable.RowList />
                )}
                <RecordTable.CursorForwardSkeleton
                  handleFetchMore={handleFetchMore}
                />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.CursorProvider>
        </RecordTable.Provider>
      )}
    </div>
  );
}
