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

type ImportExportContentType = {
  contentType: string;
  label: string;
};

type ImportDisplayStatus = TImportProgress['status'] | 'partial';

const IMPORT_STATUS_META: Record<
  ImportDisplayStatus,
  { variant: 'success' | 'destructive' | 'secondary' | 'warning' | 'info' }
> = {
  pending: { variant: 'secondary' },
  validating: { variant: 'warning' },
  processing: { variant: 'info' },
  completed: { variant: 'success' },
  partial: { variant: 'warning' },
  failed: { variant: 'destructive' },
  cancelled: { variant: 'secondary' },
};

export const importHistoryColumns = ({
  t,
  contentTypes = [],
}: {
  t: (key: string) => string;
  contentTypes?: ImportExportContentType[];
}): ColumnDef<TImportProgress>[] => [
  {
    id: 'actions',
    size: 34,
    minSize: 34,
    cell: ({ row }) => <ImportHistoryActionsCell importItem={row.original} />,
  },
  {
    id: 'fileName',
    accessorKey: 'fileName',
    size: 220,
    minSize: 180,
    header: () => <RecordTable.InlineHead label={t('file')} />,
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
    size: 120,
    minSize: 100,
    header: () => <RecordTable.InlineHead label={t('type')} />,
    cell: ({ row }) => (
      <RecordTableInlineCell className="whitespace-nowrap">
        <Badge variant="secondary" className="font-normal">
          {formatImportExportEntityTypeLabel(
            row.original.entityType,
            contentTypes,
          )}
        </Badge>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    size: 100,
    minSize: 90,
    header: () => <RecordTable.InlineHead label={t('status')} />,
    cell: ({ row }) => {
      const rawStatus = row.original.status;
      // a finished run with some bad rows is not a failure
      const status: ImportDisplayStatus =
        rawStatus === 'completed' && (row.original.errorRows || 0) > 0
          ? 'partial'
          : rawStatus;
      const statusMeta =
        IMPORT_STATUS_META[status] || IMPORT_STATUS_META.pending;

      return (
        <RecordTableInlineCell>
          <Badge
            variant={statusMeta.variant}
            className="uppercase tracking-wide text-[11px] px-2 py-0.5"
          >
            {t(`status-${status}`)}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'totalRows',
    accessorKey: 'totalRows',
    size: 84,
    minSize: 72,
    header: () => <RecordTable.InlineHead label={t('records')} />,
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
    size: 90,
    minSize: 78,
    header: () => <RecordTable.InlineHead label={t('succeeded')} />,
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
    size: 80,
    minSize: 72,
    header: () => <RecordTable.InlineHead label={t('failed')} />,
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
    size: 118,
    minSize: 108,
    header: () => <RecordTable.InlineHead label={t('created')} />,
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
    size: 118,
    minSize: 108,
    header: () => <RecordTable.InlineHead label={t('completed')} />,
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
    size: 82,
    minSize: 72,
    header: () => <RecordTable.InlineHead label={t('duration')} />,
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
];
