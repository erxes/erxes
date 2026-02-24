import { IconDotsVertical, IconFileText } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  DropdownMenu,
  PageSubHeader,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Skeleton,
  TextOverflowTooltip,
} from 'erxes-ui';
import { TImportProgress } from 'ui-modules';
import { useImportHistories } from '~/modules/import-export/import/hooks/useImportHistories';
import { formatImportExportDuration } from '~/modules/import-export/shared/import-export-duration';

function ImportHistoryActionsCell({
  importItem,
}: {
  importItem: TImportProgress;
}) {
  const canOpenErrorFile = !!importItem.errorFileUrl;

  if (!canOpenErrorFile) {
    return (
      <RecordTableInlineCell className="justify-end text-xs text-muted-foreground" />
    );
  }

  function handleOpenErrorFile() {
    if (!importItem.errorFileUrl) {
      return;
    }

    window.open(importItem.errorFileUrl, '_blank');
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <RecordTableInlineCell className="justify-center cursor-pointer">
          <IconDotsVertical className="size-4 text-muted-foreground" />
        </RecordTableInlineCell>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={handleOpenErrorFile}>
          <IconFileText /> View error file
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

const importHistoryColumns: ColumnDef<TImportProgress>[] = [
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
      const statusVariantMap: Record<
        string,
        'success' | 'destructive' | 'secondary'
      > = {
        completed: 'success',
        failed: 'destructive',
      };
      const variant = statusVariantMap[status] || 'secondary';

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
    id: 'successRows',
    accessorKey: 'successRows',
    header: () => <RecordTable.InlineHead label="Succeeded" />,
    cell: ({ row }) => {
      const successRows = row.original.successRows || 0;
      return (
        <RecordTableInlineCell className="justify-end whitespace-nowrap tabular-nums">
          {successRows.toLocaleString()}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'errorRows',
    accessorKey: 'errorRows',
    header: () => <RecordTable.InlineHead label="Failed" />,
    cell: ({ row }) => {
      const errorRows = row.original.errorRows || 0;
      return (
        <RecordTableInlineCell className="justify-end whitespace-nowrap tabular-nums">
          {errorRows.toLocaleString()}
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
        row.original || ({} as TImportProgress);

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
    cell: ({ row }) => <ImportHistoryActionsCell importItem={row.original} />,
    size: 60,
  },
];

export function ImportHistories({ entityType }: { entityType: string }) {
  const {
    list,
    totalCount,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
  } = useImportHistories({ entityType });

  if (error) {
    return (
      <div className="p-4 border rounded-md text-sm text-destructive">
        Failed to load import histories.
      </div>
    );
  }

  if (!list.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No import histories</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageSubHeader className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Import history</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review your past imports.
          </p>
        </div>
        <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
          {totalCount
            ? `${totalCount} records found`
            : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
        </div>
      </PageSubHeader>

      <RecordTable.Provider
        columns={importHistoryColumns}
        data={list}
        className="border rounded-md overflow-hidden"
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={list.length}
          sessionKey="import_histories_cursor"
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
    </div>
  );
}
