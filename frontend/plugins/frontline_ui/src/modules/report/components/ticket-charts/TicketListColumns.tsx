import { Badge, RecordTable, RecordTableInlineCell } from 'erxes-ui';
import {
  BranchesInline,
  DepartmentsInline,
  IField,
  MembersInline,
  TagBadge,
  useFields,
} from 'ui-modules';
import { ColumnDef, Cell } from '@tanstack/react-table';
import { formatDate, isValid } from 'date-fns';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { IconTicket } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { TicketListItem } from '@/report/hooks/useTicketList';
import { TicketExportItem } from '@/report/hooks/useTicketExport';
import { TicketExportColumn } from '@/report/utils/exportCsv';
import { StatusInlineIcon } from '@/status/components/StatusInline';
import { PriorityBadge } from '@/ticket/components/ticket-selects/PriorityInline';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';

const TICKET_LIST_ACTION_COLUMN = 'more';

const TICKET_LIST_PROPERTY_PREFIX = 'property_';

const TICKET_LIST_DEFAULT_COLUMNS = new Set([
  'name',
  'createdAt',
  'status',
  'state',
  'assigneeId',
  'targetDate',
  TICKET_LIST_ACTION_COLUMN,
]);

export interface TicketListVisibleColumn {
  id: string;
  header: string;
}

const EmptyValue = () => (
  <span className="text-xs text-muted-foreground">—</span>
);

const formatDateValue = (value: unknown, pattern: string) => {
  if (!value) return '';
  const date = new Date(value as string);
  return isValid(date) ? formatDate(date, pattern) : '';
};

const EXPORT_DATE_FORMAT = 'yyyy-MM-dd HH:mm';

const TICKET_EXPORT_VALUES: Partial<
  Record<string, (ticket: TicketExportItem) => string>
> = {
  name: (ticket) => ticket.name ?? '',
  number: (ticket) => ticket.number ?? '',
  createdAt: (ticket) => formatDateValue(ticket.createdAt, EXPORT_DATE_FORMAT),
  status: (ticket) => ticket.statusName || ticket.statusLabel || '',
  state: (ticket) => ticket.state ?? '',
  priority: (ticket) => ticket.priorityLabel ?? '',
  assigneeId: (ticket) => ticket.assigneeName ?? '',
  createdBy: (ticket) => ticket.createdByName ?? '',
  channel: (ticket) => ticket.channelName ?? '',
  pipeline: (ticket) => ticket.pipelineName ?? '',
  tags: (ticket) => (ticket.tagNames ?? []).join(', '),
  branchId: (ticket) => ticket.branchName ?? '',
  departmentId: (ticket) => ticket.departmentName ?? '',
  startDate: (ticket) => formatDateValue(ticket.startDate, EXPORT_DATE_FORMAT),
  targetDate: (ticket) =>
    formatDateValue(ticket.targetDate, EXPORT_DATE_FORMAT),
};

const toPropertyText = (
  field: IField,
  value: unknown,
  t: TFunction,
): string => {
  if (value === undefined || value === null || value === '') return '';

  if (Array.isArray(value)) {
    return value
      .map((item) => toPropertyText(field, item, t))
      .filter(Boolean)
      .join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? t('yes', 'Yes') : t('no', 'No');
  }

  if (typeof value === 'object') {
    const { name, label, title } = value as Record<string, unknown>;
    const text = name ?? label ?? title;
    return typeof text === 'string' ? text : '';
  }

  if (field.type === 'date') {
    return formatDateValue(value, 'dd/MM/yyyy');
  }

  const text = String(value);
  const options = field.options ?? field.selectOptions ?? [];
  const option = options.find((item) => item.value === text);

  if (option) return option.label;

  return field.type === 'editor' ? text.replace(/<[^>]*>/g, ' ').trim() : text;
};

const PropertyCell = ({ field, value }: { field: IField; value: unknown }) => {
  const { t } = useTranslation('frontline');
  const text = toPropertyText(field, value, t);

  return (
    <RecordTableInlineCell className="text-xs">
      {text ? <span className="truncate">{text}</span> : <EmptyValue />}
    </RecordTableInlineCell>
  );
};

const PipelineCell = ({ pipelineId }: { pipelineId?: string }) => {
  const { pipeline } = useGetPipeline(pipelineId);

  return (
    <RecordTableInlineCell className="text-xs">
      {pipeline?.name ? (
        <span className="truncate">{pipeline.name}</span>
      ) : (
        <EmptyValue />
      )}
    </RecordTableInlineCell>
  );
};

const TicketMoreCell = ({ cell }: { cell: Cell<TicketListItem, unknown> }) => {
  const { _id } = cell.row.original || {};
  const navigate = useNavigate();
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => navigate(`/frontline/tickets?ticketId=${_id}`)}
    >
      <IconTicket />
    </RecordTable.MoreButton>
  );
};

export const TicketListColumnDefaults = ({
  onVisibleColumnsChange,
}: {
  onVisibleColumnsChange?: (columns: TicketListVisibleColumn[]) => void;
}) => {
  const { table } = RecordTable.useRecordTable();
  const columnKey = table
    .getAllLeafColumns()
    .map((column) => column.id)
    .join(',');
  const orderKey = table.getState().columnOrder.join(',');
  const visibleKey = JSON.stringify(
    table
      .getVisibleLeafColumns()
      .filter(
        (column) =>
          column.id !== TICKET_LIST_ACTION_COLUMN &&
          typeof column.columnDef.header === 'string',
      )
      .map((column) => ({
        id: column.id,
        header: column.columnDef.header as string,
      })),
  );

  useEffect(() => {
    onVisibleColumnsChange?.(JSON.parse(visibleKey));
  }, [visibleKey, onVisibleColumnsChange]);

  useEffect(() => {
    const visibility = table.getState().columnVisibility;
    const hidden = columnKey
      .split(',')
      .filter(
        (id) =>
          id &&
          !TICKET_LIST_DEFAULT_COLUMNS.has(id) &&
          visibility[id] === undefined,
      );

    if (hidden.length) {
      table.setColumnVisibility((prev) => ({
        ...prev,
        ...Object.fromEntries(hidden.map((id) => [id, false])),
      }));
    }
  }, [columnKey, table]);

  useEffect(() => {
    const order = orderKey.split(',').filter(Boolean);

    if (
      order.includes(TICKET_LIST_ACTION_COLUMN) &&
      order[order.length - 1] !== TICKET_LIST_ACTION_COLUMN
    ) {
      table.setColumnOrder([
        ...order.filter((id) => id !== TICKET_LIST_ACTION_COLUMN),
        TICKET_LIST_ACTION_COLUMN,
      ]);
    }
  }, [orderKey, table]);

  return null;
};

export const useTicketExportColumns = () => {
  const { t } = useTranslation('frontline');
  const { fields } = useFields({ contentType: 'frontline:ticket' });

  return useCallback(
    (columns: TicketListVisibleColumn[]): TicketExportColumn[] => {
      const fieldsById = new Map(
        (fields as IField[]).map((field) => [field._id, field]),
      );

      return columns.flatMap(({ id, header }) => {
        if (id.startsWith(TICKET_LIST_PROPERTY_PREFIX)) {
          const field = fieldsById.get(
            id.slice(TICKET_LIST_PROPERTY_PREFIX.length),
          );

          if (!field) return [];

          return [
            {
              key: id,
              header,
              getValue: (ticket: TicketExportItem) =>
                toPropertyText(field, ticket.propertiesData?.[field._id], t),
            },
          ];
        }

        const getValue = TICKET_EXPORT_VALUES[id];

        return getValue ? [{ key: id, header, getValue }] : [];
      });
    },
    [fields, t],
  );
};

export const useTicketListColumns = (): ColumnDef<TicketListItem>[] => {
  const { t } = useTranslation('frontline');
  const { channels } = useGetChannels();
  const { fields } = useFields({ contentType: 'frontline:ticket' });

  return useMemo(() => {
    const channelNames = new Map(
      (channels ?? []).map((channel) => [channel._id, channel.name]),
    );

    const propertyColumns: ColumnDef<TicketListItem>[] = (
      fields as IField[]
    ).map((field) => ({
      id: `${TICKET_LIST_PROPERTY_PREFIX}${field._id}`,
      header: field.name || field.code || field._id,
      size: 180,
      cell: ({ row }) => (
        <PropertyCell
          field={field}
          value={row.original.propertiesData?.[field._id]}
        />
      ),
    }));

    return [
      {
        id: 'name',
        header: t('name', 'Name'),
        accessorKey: 'name',
        cell: ({ cell }) => (
          <RecordTableInlineCell className="px-4 text-xs font-medium">
            {cell.getValue() as string}
          </RecordTableInlineCell>
        ),
      },
      {
        id: 'number',
        header: t('number', 'Number'),
        accessorKey: 'number',
        size: 100,
        cell: ({ cell }) => {
          const number = cell.getValue() as string | undefined;
          return (
            <RecordTableInlineCell className="text-xs text-muted-foreground">
              {number || <EmptyValue />}
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'createdAt',
        header: t('created', 'Created'),
        accessorKey: 'createdAt',
        cell: ({ cell }) => (
          <RecordTableInlineCell>
            <span className="text-xs text-muted-foreground">
              {formatDateValue(cell.getValue(), 'dd/MM/yyyy HH:mm')}
            </span>
          </RecordTableInlineCell>
        ),
      },
      {
        id: 'status',
        header: t('status', 'Status'),
        accessorKey: 'status',
        size: 160,
        cell: ({ cell }) => {
          const status = cell.getValue<TicketListItem['status']>();

          if (!status) {
            return (
              <RecordTableInlineCell className="flex items-center justify-center">
                <EmptyValue />
              </RecordTableInlineCell>
            );
          }

          return (
            <RecordTableInlineCell className="flex items-center justify-center">
              <Badge
                variant="secondary"
                className="text-xs gap-1 max-w-40 truncate"
                style={{
                  backgroundColor: status.color
                    ? `${status.color}1a`
                    : undefined,
                  color: status.color,
                }}
              >
                <StatusInlineIcon
                  statusType={status.type}
                  color={status.color}
                  className="size-3"
                />
                <span className="truncate">{status.name}</span>
              </Badge>
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'state',
        header: t('state', 'State'),
        accessorKey: 'state',
        size: 80,
        cell: ({ cell }) => {
          const state = cell.getValue() as string | undefined;
          return (
            <RecordTableInlineCell className="flex items-center justify-center">
              {state ? (
                <Badge className="text-xs capitalize">{state}</Badge>
              ) : (
                <EmptyValue />
              )}
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'priority',
        header: t('priority', 'Priority'),
        accessorKey: 'priority',
        size: 140,
        cell: ({ cell }) => (
          <RecordTableInlineCell className="text-xs">
            <PriorityBadge priority={(cell.getValue() as number) ?? 0} />
          </RecordTableInlineCell>
        ),
      },
      {
        id: 'assigneeId',
        header: t('assigned', 'Assigned'),
        accessorKey: 'assigneeId',
        cell: ({ cell }) => {
          const assigneeId = cell.getValue() as string;
          if (!assigneeId)
            return (
              <RecordTableInlineCell className="text-xs text-muted-foreground">
                {t('unassigned', 'Unassigned')}
              </RecordTableInlineCell>
            );
          return (
            <RecordTableInlineCell>
              <MembersInline.Provider memberIds={[assigneeId]}>
                <MembersInline.Avatar size="sm" />
                <MembersInline.Title className="text-xs text-muted-foreground" />
              </MembersInline.Provider>
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'createdBy',
        header: t('created-by', 'Created by'),
        accessorKey: 'createdBy',
        cell: ({ cell }) => {
          const createdBy = cell.getValue() as string | undefined;
          return (
            <RecordTableInlineCell>
              {createdBy ? (
                <MembersInline.Provider memberIds={[createdBy]}>
                  <MembersInline.Avatar size="sm" />
                  <MembersInline.Title className="text-xs text-muted-foreground" />
                </MembersInline.Provider>
              ) : (
                <EmptyValue />
              )}
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'channel',
        header: t('channel', 'Channel'),
        accessorKey: 'channelId',
        size: 160,
        cell: ({ cell }) => {
          const name = channelNames.get(cell.getValue() as string);
          return (
            <RecordTableInlineCell className="text-xs">
              {name ? <span className="truncate">{name}</span> : <EmptyValue />}
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'pipeline',
        header: t('pipeline', 'Pipeline'),
        accessorKey: 'pipelineId',
        size: 160,
        cell: ({ cell }) => (
          <PipelineCell pipelineId={cell.getValue() as string | undefined} />
        ),
      },
      {
        id: 'tags',
        header: t('tags', 'Tags'),
        accessorKey: 'tagIds',
        size: 200,
        cell: ({ cell }) => {
          const tagIds = (cell.getValue() as string[] | undefined) ?? [];
          return (
            <RecordTableInlineCell className="gap-1 overflow-hidden">
              {tagIds.length ? (
                tagIds.map((tagId) => (
                  <TagBadge key={tagId} tagId={tagId} variant="secondary" />
                ))
              ) : (
                <EmptyValue />
              )}
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'branchId',
        header: t('branch-label', 'Branch'),
        accessorKey: 'branchId',
        size: 160,
        cell: ({ cell }) => {
          const branchId = cell.getValue() as string | undefined;
          return (
            <RecordTableInlineCell className="text-xs">
              {branchId ? (
                <BranchesInline branchIds={[branchId]} />
              ) : (
                <EmptyValue />
              )}
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'departmentId',
        header: t('department-label', 'Department'),
        accessorKey: 'departmentId',
        size: 160,
        cell: ({ cell }) => {
          const departmentId = cell.getValue() as string | undefined;
          return (
            <RecordTableInlineCell className="text-xs">
              {departmentId ? (
                <DepartmentsInline departmentIds={[departmentId]} />
              ) : (
                <EmptyValue />
              )}
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'startDate',
        header: t('start-date', 'Start date'),
        accessorKey: 'startDate',
        size: 100,
        cell: ({ cell }) => (
          <RecordTableInlineCell className="text-xs text-muted-foreground">
            {formatDateValue(cell.getValue(), 'dd/MM/yyyy') || '—'}
          </RecordTableInlineCell>
        ),
      },
      {
        id: 'targetDate',
        header: t('due-date', 'Due Date'),
        accessorKey: 'targetDate',
        size: 100,
        cell: ({ cell }) => (
          <RecordTableInlineCell className="text-xs text-muted-foreground">
            {formatDateValue(cell.getValue(), 'dd/MM/yyyy') || '—'}
          </RecordTableInlineCell>
        ),
      },
      ...propertyColumns,
      {
        id: TICKET_LIST_ACTION_COLUMN,
        header: () => <RecordTable.ColumnSelector align="end" />,
        size: 33,
        cell: ({ cell }) => <TicketMoreCell cell={cell} />,
      },
    ];
  }, [t, channels, fields]);
};
