import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  useQueryState,
} from 'erxes-ui';
import { ISegment } from 'ui-modules';
import { segmentMoreColumn } from './SegmentsMoreColumn';

const columns: (t: (key: string) => string) => ColumnDef<ISegment>[] = (t) => [
  segmentMoreColumn,
  {
    ...RecordTable.checkboxColumn,
    size: 33,
  } as ColumnDef<ISegment>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name')} />,
    cell: ({ cell }) => {
      const [, setSegmentId] = useQueryState('segmentId');

      return (
        <div className="pl-2">
          <Badge
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setSegmentId(cell.row.original._id);
            }}
          >
            {cell.getValue() as string}
          </Badge>
        </div>
      );
    },
  },

  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label={t('description')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'membersCount',
    accessorKey: 'membersCount',
    header: () => <RecordTable.InlineHead label={t('count')} />,
    cell: ({ cell }) => {
      const { status, membersCount, buildProcessed } = cell.row.original;

      if (status === 'building') {
        return (
          <RecordTableInlineCell>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <IconLoader2 className="size-3.5 animate-spin text-primary" />
              {buildProcessed ?? 0}
            </span>
          </RecordTableInlineCell>
        );
      }

      if (status === 'failed' || status === 'cancelled') {
        return (
          <RecordTableInlineCell>
            <span
              className="flex items-center gap-1.5 text-destructive"
              title={t(
                status === 'cancelled' ? 'count-stopped' : 'count-failed',
              )}
            >
              <IconAlertTriangle className="size-3.5" />
              {membersCount ?? 0}
            </span>
          </RecordTableInlineCell>
        );
      }

      return (
        <RecordTableInlineCell>
          {membersCount === undefined || membersCount === null ? (
            <span className="text-muted-foreground">{t('not-counted')}</span>
          ) : (
            membersCount
          )}
        </RecordTableInlineCell>
      );
    },
  },
];

export default columns;
