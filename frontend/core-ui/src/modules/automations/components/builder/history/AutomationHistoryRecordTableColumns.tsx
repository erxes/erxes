import { AutomationHistoryDetail } from '@/automations/components/builder/history/components/AutomationHistoryDetail';
import { AutomationHistoryResultName } from '@/automations/components/builder/history/components/AutomationHistoryResultName';
import { AutomationHistoryTriggerCell } from '@/automations/components/builder/history/components/AutomationHistoryTriggerCell';
import { STATUSES_BADGE_VARIABLES } from '@/automations/constants';
import { StatusBadgeValue } from '@/automations/types';
import { IconCalendarTime } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import dayjs from 'dayjs';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { IAutomationHistory } from 'ui-modules';

export const automationHistoriesColumns: ColumnDef<IAutomationHistory>[] = [
  {
    id: 'more',
    cell: ({ cell }) => <AutomationHistoryDetail history={cell.row.original} />,
    size: 33,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead label="Title" />,
    cell: AutomationHistoryResultName,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label="Description" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'trigger',
    accessorKey: 'trigger',
    header: () => <RecordTable.InlineHead label="Trigger" />,
    cell: AutomationHistoryTriggerCell,
  },

  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Status" />,
    cell: ({ cell }) => {
      const status = cell.getValue() as IAutomationHistory['status'];

      const variant: StatusBadgeValue = STATUSES_BADGE_VARIABLES[status];

      return (
        <RecordTableInlineCell>
          <Badge variant={variant}>{status}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarTime} label="Created At" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <RelativeDateDisplay.Value
          value={dayjs(cell.getValue() as string).format('YYYY-MM-DD HH:mm:ss')}
        />
      </RecordTableInlineCell>
    ),
  },
];
