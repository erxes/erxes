import { AutomationHistoryDetail } from '@/automations/components/builder/history/components/AutomationHistoryDetail';
import { AutomationHistoryPopoverValue } from '@/automations/components/builder/history/components/AutomationHistoryPopoverValue';
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
import { useTranslation } from 'react-i18next';

const TitleHeader = () => {
  const { t } = useTranslation('automations');
  return <RecordTable.InlineHead label={t('name')} />;
};

const DescriptionHeader = () => {
  const { t } = useTranslation('automations');
  return <RecordTable.InlineHead label={t('trigger')} />;
};

const TriggerHeader = () => {
  const { t } = useTranslation('automations');
  return <RecordTable.InlineHead label={t('trigger')} />;
};

const StatusHeader = () => {
  const { t } = useTranslation('automations');
  return <RecordTable.InlineHead label={t('status')} />;
};

const CreatedAtHeader = () => {
  const { t } = useTranslation('automations');
  return <RecordTable.InlineHead icon={IconCalendarTime} label={t('created-at')} />;
};

export const automationHistoriesColumns: ColumnDef<IAutomationHistory>[] = [
  {
    id: 'more',
    cell: ({ cell }) => (
      <AutomationHistoryDetail executionId={cell.row.original._id} />
    ),
    size: 33,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: TitleHeader,
    cell: AutomationHistoryResultName,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: DescriptionHeader,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="p-0">
        <AutomationHistoryPopoverValue
          preview={(cell.getValue() as string) || 'No description'}
          content={(cell.getValue() as string) || 'No description'}
        />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'trigger',
    accessorKey: 'trigger',
    header: TriggerHeader,
    cell: AutomationHistoryTriggerCell,
  },

  {
    id: 'status',
    accessorKey: 'status',
    header: StatusHeader,
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
    header: CreatedAtHeader,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <RelativeDateDisplay.Value
          value={dayjs(cell.getValue() as string).format('YYYY-MM-DD HH:mm:ss')}
        />
      </RecordTableInlineCell>
    ),
  },
];
