/* eslint-disable react-hooks/rules-of-hooks */
import { TicketHotKeyScope } from '@/ticket/types';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { ticketDetailSheetState } from '@/ticket/states/ticketDetailSheetState';
import { ITicket } from '@/ticket/types';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import {
  IconAlertSquareRounded,
  IconCalendarFilled,
  IconLabelFilled,
  IconProgressCheck,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import clsx from 'clsx';
import {
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  Tooltip,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { ticketsMoreColumn } from './TicketsMoreColumn';

export const ticketsColumns = (): ColumnDef<ITicket>[] => {
  const checkBoxColumn = RecordTable.checkboxColumn as ColumnDef<ITicket>;

  return [
    ticketsMoreColumn,
    checkBoxColumn,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => (
        <RecordTable.InlineHead label="Name" icon={IconLabelFilled} />
      ),
      cell: ({ cell }) => {
        const name = cell.getValue() as string;
        const [value, setValue] = useState(name);
        const { updateTicket } = useUpdateTicket();
        const setActiveTicket = useSetAtom(ticketDetailSheetState);

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
      },
      size: 240,
    },

    {
      id: 'status',
      accessorKey: 'status',
      header: () => (
        <RecordTable.InlineHead label="Status" icon={IconProgressCheck} />
      ),
      cell: ({ cell }) => {
        return (
          <SelectStatusTicket
            variant="table"
            id={cell.row.original._id}
            value={cell.row.original.statusId}
            pipelineId={cell.row.original.pipelineId}
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
        <RecordTable.InlineHead label="Channel" icon={IconProgressCheck} />
      ),
      cell: ({ cell }) => {
        return (
          <Tooltip>
            <div className="relative">
              <Tooltip.Trigger className="absolute inset-0 cursor-not-allowed"></Tooltip.Trigger>
              <Tooltip.Content>Channel cannot be changed</Tooltip.Content>
              <SelectChannel
                variant="table"
                value={cell.row.original.channelId}
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
        <RecordTable.InlineHead label="Pipeline" icon={IconProgressCheck} />
      ),
      cell: ({ cell }) => {
        return (
          <Tooltip>
            <div className="relative">
              <Tooltip.Trigger className="absolute inset-0 cursor-not-allowed"></Tooltip.Trigger>
              <Tooltip.Content>Pipeline cannot be changed</Tooltip.Content>
              <SelectPipeline
                variant="table"
                value={cell.row.original.pipelineId}
                channelId={cell.row.original.channelId}
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
      id: 'assigneeId',
      header: () => <RecordTable.InlineHead label="Assignee" icon={IconUser} />,
      cell: ({ cell }) => {
        return (
          <SelectAssigneeTicket
            variant="table"
            id={cell.row.original._id}
            value={cell.row.original.assigneeId}
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
          label="Priority"
          icon={IconAlertSquareRounded}
        />
      ),
      cell: ({ cell }) => {
        return (
          <SelectPriorityTicket
            value={cell.row.original.priority}
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
        <RecordTable.InlineHead label="Start Date" icon={IconCalendarFilled} />
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
        <RecordTable.InlineHead label="Target Date" icon={IconCalendarFilled} />
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
