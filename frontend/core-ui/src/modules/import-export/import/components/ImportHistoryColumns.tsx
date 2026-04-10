import { IconFileText } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
} from 'erxes-ui';
import { TImportProgress } from 'ui-modules';
import { formatImportExportEntityTypeLabel } from '~/modules/import-export/shared/formatEntityTypeLabel';
import { formatImportExportDuration } from '~/modules/import-export/shared/import-export-duration';
import { ImportHistoryActionsCell } from './ImportHistoryActionsCell';

const IMPORT_STATUS_META: Record<
  TImportProgress['status'],
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

export const importHistoryColumns = (): ColumnDef<TImportProgress>[] => [
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
          {formatImportExportEntityTypeLabel(row.original.entityType)}
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
        IMPORT_STATUS_META[status] || IMPORT_STATUS_META.pending;

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
