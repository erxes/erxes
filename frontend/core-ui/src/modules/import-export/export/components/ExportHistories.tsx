import {
  IconDotsVertical,
  IconDownload,
  IconFileText,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  DropdownMenu,
  PageSubHeader,
  REACT_APP_API_URL,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Skeleton,
  TextOverflowTooltip,
} from 'erxes-ui';
import { TExportProgress } from 'ui-modules';
import { useExportHistories } from '~/modules/import-export/export/hooks/useExportHistories';
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

    const downloadName =
      exportItem.fileName ||
      `export-${exportItem._id}.${exportItem.fileFormat || 'csv'}`;

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
          <IconDownload /> Download
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

const exportHistoryColumns: ColumnDef<TExportProgress>[] = [
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
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === 'completed'
          ? 'success'
          : status === 'failed'
          ? 'destructive'
          : 'secondary';

      return (
        <RecordTableInlineCell>
          <Badge
            variant={variant}
            className="uppercase tracking-wide text-[11px] px-2 py-0.5"
          >
            {status}
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
          {startedAt &&
            completedAt &&
            formatImportExportDuration(startedAt, completedAt)}
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

export function ExportHistories({ entityTypes }: { entityTypes: string[] }) {
  const {
    list,
    totalCount,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
    Queries,
  } = useExportHistories({ entityTypes });

  if (error) {
    return (
      <div className="p-4 border rounded-md text-sm text-destructive">
        Failed to load export histories.
      </div>
    );
  }
  if (!list.length) {
    return (
      <>
        {Queries}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No export histories</p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {Queries}

      {error ? (
        <div className="p-4 border rounded-md text-sm text-destructive">
          Failed to load export histories.
        </div>
      ) : !loading && !list.length ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No export histories</p>
        </div>
      ) : (
        <>
          <PageSubHeader className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Export history</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Review and download your past exports.
              </p>
            </div>
            <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
              {totalCount
                ? `${totalCount} records found`
                : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
            </div>
          </PageSubHeader>

          <RecordTable.Provider
            columns={exportHistoryColumns}
            data={list}
            className="border rounded-md overflow-hidden"
          >
            <RecordTable.CursorProvider
              hasPreviousPage={hasPreviousPage}
              hasNextPage={hasNextPage}
              dataLength={list.length}
              sessionKey="export_histories_cursor"
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
        </>
      )}
    </div>
  );
}
