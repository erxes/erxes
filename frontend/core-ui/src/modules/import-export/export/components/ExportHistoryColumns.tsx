import { IconAlertCircle, IconFileText } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
} from 'erxes-ui';
import { TExportProgress } from 'ui-modules';
import { formatImportExportEntityTypeLabel } from '~/modules/import-export/shared/formatEntityTypeLabel';
import { formatImportExportDuration } from '~/modules/import-export/shared/import-export-duration';
import { ExportHistoryActionsCell } from './ExportHistoryActionsCell';

type ImportExportContentType = {
  contentType: string;
  label: string;
};

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

export const exportHistoryColumns = (
  contentTypes: ImportExportContentType[] = [],
): ColumnDef<TExportProgress>[] => [
  {
    id: 'actions',
    size: 34,
    minSize: 34,
    cell: ({ row }) => <ExportHistoryActionsCell exportItem={row.original} />,
  },
  {
    id: 'fileName',
    accessorKey: 'fileName',
    size: 220,
    minSize: 180,
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
    size: 120,
    minSize: 100,
    header: () => <RecordTable.InlineHead label="Type" />,
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
    header: () => <RecordTable.InlineHead label="Status" />,
    cell: ({ row }) => {
      const { status, errorMessage } = row.original;
      const statusMeta =
        EXPORT_STATUS_META[status] || EXPORT_STATUS_META.pending;

      const badge = (
        <Badge
          variant={statusMeta.variant}
          className="uppercase tracking-wide text-[11px] px-2 py-0.5"
        >
          {statusMeta.label}
        </Badge>
      );

      if (status === 'failed' && errorMessage) {
        return (
          <RecordTableInlineCell className="gap-1.5">
            <Popover>
              <Popover.Trigger asChild>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  {badge}
                  <IconAlertCircle className="size-3.5 text-destructive flex-shrink-0" />
                </div>
              </Popover.Trigger>
              <Popover.Content
                side="top"
                align="start"
                className="w-auto max-w-xs text-xs break-words"
              >
                <p className="font-medium text-destructive mb-1">
                  Export failed
                </p>
                <p className="text-muted-foreground">{errorMessage}</p>
              </Popover.Content>
            </Popover>
          </RecordTableInlineCell>
        );
      }

      return <RecordTableInlineCell>{badge}</RecordTableInlineCell>;
    },
  },
  {
    id: 'totalRows',
    accessorKey: 'totalRows',
    size: 84,
    minSize: 72,
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
    size: 100,
    minSize: 90,
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
    size: 118,
    minSize: 108,
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
    size: 118,
    minSize: 108,
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
    size: 82,
    minSize: 72,
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
];
