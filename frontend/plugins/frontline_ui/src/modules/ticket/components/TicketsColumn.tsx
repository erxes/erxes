import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectStructureTicket } from '@/ticket/components/ticket-selects/SelectStructureTicket';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { useTicketDetailSheet } from '@/ticket/hooks/useTicketDetailSheet';
import { ITicket, TicketHotKeyScope } from '@/ticket/types';
import { compactList } from '@/shared/utils/cursorList';
import {
  IconAlertSquareRounded,
  IconCalendarFilled,
  IconHierarchy,
  IconLabelFilled,
  IconProgressCheck,
  IconUser,
} from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/table-core';
import clsx from 'clsx';
import {
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  Tooltip,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ticketsMoreColumn } from './TicketsMoreColumn';

const TicketNameCell = ({ cell }: CellContext<ITicket, unknown>) => {
  const name = cell.getValue() as string;
  const [value, setValue] = useState(name);
  const { updateTicket } = useUpdateTicket();
  const [, setActiveTicket] = useTicketDetailSheet();

  const handleUpdate = () => {
    if (value !== name) {
      updateTicket({
        variables: { _id: cell.row.original._id, name: value },
      });
    }
  };

  return (
    <PopoverScoped
      closeOnEnter
      onOpenChange={(open) => {
        if (!open) {
          handleUpdate();
        }
      }}
      scope={clsx(
        TicketHotKeyScope.TicketTableCell,
        cell.row.original._id,
        'Name',
      )}
    >
      <RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Anchor
          onClick={() => setActiveTicket(cell.row.original._id)}
        >
          {name}
        </RecordTableInlineCell.Anchor>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="min-w-72">
        <Input
          value={value || ''}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleUpdate();
            }
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const useTicketsColumns = (): ColumnDef<ITicket>[] => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  const { t: tStructure } = useTranslation('common', {
    keyPrefix: 'structure-entities',
  });
  const checkBoxColumn = RecordTable.checkboxColumn as ColumnDef<ITicket>;

  return [
    ticketsMoreColumn,
    checkBoxColumn,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => (
        <RecordTable.InlineHead
          label={t('name', 'Name')}
          icon={IconLabelFilled}
        />
      ),
      cell: TicketNameCell,
      size: 240,
    },

    {
      id: 'status',
      accessorKey: 'status',
      header: () => (
        <RecordTable.InlineHead
          label={t('status', 'Status')}
          icon={IconProgressCheck}
        />
      ),
      cell: ({ cell }) => {
        return (
          <SelectStatusTicket
            variant="table"
            id={cell.row.original._id}
            value={cell.row.original.statusId ?? ''}
            pipelineId={cell.row.original.pipelineId ?? ''}
            scope={clsx(
              TicketHotKeyScope.TicketTableCell,
              cell.row.original._id,
              'Status',
            )}
          />
        );
      },
      size: 170,
    },
    {
      id: 'channel',
      accessorKey: 'channel',
      header: () => (
        <RecordTable.InlineHead
          label={t('channel', 'Channel')}
          icon={IconProgressCheck}
        />
      ),
      cell: ({ cell }) => {
        return (
          <Tooltip>
            <div className="relative">
              <Tooltip.Trigger className="absolute inset-0 cursor-not-allowed" />
              <Tooltip.Content>
                {t('channel-cannot-be-changed', 'Channel cannot be changed')}
              </Tooltip.Content>
              <SelectChannel
                variant="table"
                value={cell.row.original.channelId ?? ''}
                disabled
                scope={clsx(
                  TicketHotKeyScope.TicketTableCell,
                  cell.row.original._id,
                  'Channel',
                )}
              />
            </div>
          </Tooltip>
        );
      },
      size: 170,
    },
    {
      id: 'pipeline',
      accessorKey: 'pipeline',
      header: () => (
        <RecordTable.InlineHead
          label={t('pipeline', 'Pipeline')}
          icon={IconProgressCheck}
        />
      ),
      cell: ({ cell }) => {
        return (
          <Tooltip>
            <div className="relative">
              <Tooltip.Trigger className="absolute inset-0 cursor-not-allowed" />
              <Tooltip.Content>
                {t('pipeline-cannot-be-changed', 'Pipeline cannot be changed')}
              </Tooltip.Content>
              <SelectPipeline
                variant="table"
                value={cell.row.original.pipelineId ?? ''}
                channelId={cell.row.original.channelId ?? undefined}
                disabled
                scope={clsx(
                  TicketHotKeyScope.TicketTableCell,
                  cell.row.original._id,
                  'Pipeline',
                )}
              />
            </div>
          </Tooltip>
        );
      },
      size: 170,
    },
    {
      id: 'entityIds',
      header: () => (
        <RecordTable.InlineHead
          label={tStructure('structure')}
          icon={IconHierarchy}
        />
      ),
      cell: ({ cell }) => {
        return (
          <SelectStructureTicket
            variant="table"
            id={cell.row.original._id}
            value={compactList(cell.row.original.entityIds)}
            scope={clsx(
              TicketHotKeyScope.TicketTableCell,
              cell.row.original._id,
              'Structure',
            )}
          />
        );
      },
      size: 170,
    },
    {
      id: 'assigneeId',
      header: () => (
        <RecordTable.InlineHead
          label={t('assignee', 'Assignee')}
          icon={IconUser}
        />
      ),
      cell: ({ cell }) => {
        return (
          <SelectAssigneeTicket
            variant="table"
            id={cell.row.original._id}
            value={cell.row.original.assigneeId ?? ''}
            scope={clsx(
              TicketHotKeyScope.TicketTableCell,
              cell.row.original._id,
              'Assignee',
            )}
          />
        );
      },
      size: 240,
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      header: () => (
        <RecordTable.InlineHead
          label={t('priority', 'Priority')}
          icon={IconAlertSquareRounded}
        />
      ),
      cell: ({ cell }) => {
        return (
          <SelectPriorityTicket
            value={cell.row.original.priority ?? undefined}
            variant="table"
            id={cell.row.original._id}
            scope={clsx(
              TicketHotKeyScope.TicketTableCell,
              cell.row.original._id,
              'Priority',
            )}
          />
        );
      },
      size: 170,
    },
    {
      id: 'startDate',
      accessorKey: 'startDate',
      header: () => (
        <RecordTable.InlineHead
          label={t('start-date', 'Start date')}
          icon={IconCalendarFilled}
        />
      ),
      cell: ({ cell }) => {
        const startDate = cell.getValue() as string;
        return (
          <SelectDateTicket
            type="startDate"
            value={startDate}
            id={cell.row.original._id}
          />
        );
      },
      size: 240,
    },
    {
      id: 'targetDate',
      accessorKey: 'targetDate',
      header: () => (
        <RecordTable.InlineHead
          label={t('target-date', 'Target date')}
          icon={IconCalendarFilled}
        />
      ),
      cell: ({ cell }) => {
        const targetDate = cell.getValue() as string;
        return (
          <SelectDateTicket
            type="targetDate"
            value={targetDate}
            id={cell.row.original._id}
          />
        );
      },
      size: 240,
    },
  ];
};
