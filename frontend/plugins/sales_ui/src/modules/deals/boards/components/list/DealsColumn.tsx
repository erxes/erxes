import { BoardSelect, PipelineSelect, StageSelect } from 'ui-modules';
import {
  IconAlertSquareRounded,
  IconCalendarFilled,
  IconLabelFilled,
  IconProgressCheck,
  IconUser,
} from '@tabler/icons-react';
import {
  NameCell,
  NumberCell,
  ProductsCell,
} from '@/deals/components/deal-selects/MoveDealSelect';

import { ColumnDef } from '@tanstack/table-core';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { IDeal } from '@/deals/types/deals';
import { RecordTable } from 'erxes-ui';
import { SelectAssigneeDeal } from '@/deals/components/deal-selects/SelectAssigneeDeal';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { useMoveDealStage } from '@/deals/cards/hooks/useDeals';
import { useTranslation } from 'react-i18next';

export const DealsColumn = (): ColumnDef<IDeal>[] => {
  const { moveDealStage } = useMoveDealStage();
  const checkBoxColumn = RecordTable.checkboxColumn as ColumnDef<IDeal>;
  const { t } = useTranslation('sales');

  return [
    checkBoxColumn,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => (
        <RecordTable.InlineHead label={t('name')} icon={IconLabelFilled} />
      ),
      cell: ({ row }) => <NameCell deal={row.original} />,
      size: 240,
    },
    {
      id: 'number',
      accessorKey: 'number',
      header: () => (
        <RecordTable.InlineHead label={t('number')} icon={IconLabelFilled} />
      ),
      cell: ({ row }) => <NumberCell deal={row.original} />,
    },
    {
      id: 'boardId',
      accessorFn: (row) => row.boardId,
      header: () => (
        <RecordTable.InlineHead label={t('board')} icon={IconLabelFilled} />
      ),
      cell: ({ row }) => <BoardSelect boardId={row.original.boardId} />,
    },
    {
      id: 'pipeline',
      accessorFn: (row) => row.pipeline?.name,
      header: () => (
        <RecordTable.InlineHead label={t('pipeline')} icon={IconProgressCheck} />
      ),
      cell: ({ row }) => {
        return <PipelineSelect pipelineId={row.original.pipeline?._id} />;
      },
      size: 170,
    },
    {
      id: 'stage',
      accessorFn: (row) => row.stage?.name,
      header: () => (
        <RecordTable.InlineHead label={t('stage')} icon={IconProgressCheck} />
      ),
      cell: ({ row }) => {
        return (
          <StageSelect
            stageId={row.original.stageId}
            pipelineId={row.original.pipeline?._id || ''}
            onChange={(stageId) => {
              moveDealStage({
                deal: row.original,
                stageId,
              });
            }}
          />
        );
      },
      size: 170,
    },
    {
      id: 'products',
      accessorFn: (row) => row.products,
      header: () => (
        <RecordTable.InlineHead label={t('products')} icon={IconProgressCheck} />
      ),
      cell: ({ row }) => <ProductsCell deal={row.original} />,
    },
    {
      id: 'assignedUsers',
      accessorKey: 'assignedUserIds',
      header: () => <RecordTable.InlineHead label={t('assignee')} icon={IconUser} />,
      cell: ({ row }) => (
        <SelectAssigneeDeal
          variant="table"
          id={row.original._id}
          value={row.original.assignedUserIds || []}
        />
      ),
      size: 240,
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      header: () => (
        <RecordTable.InlineHead
          label={t('priority')}
          icon={IconAlertSquareRounded}
        />
      ),
      cell: ({ row }) => (
        <SelectDealPriority
          value={row.original.priority || ''}
          variant="table"
          dealId={row.original._id}
        />
      ),
      size: 170,
    },
    {
      id: 'startDate',
      accessorKey: 'startDate',
      header: () => (
        <RecordTable.InlineHead label={t('start-date')} icon={IconCalendarFilled} />
      ),
      cell: ({ row }) => {
        const startDate = row.original.startDate;
        return (
          <DateSelectDeal
            type="startDate"
            value={startDate || ''}
            id={row.original._id}
            placeholder={t('start-date')}
          />
        );
      },
      size: 240,
    },
    {
      id: 'closeDate',
      accessorKey: 'closeDate',
      header: () => (
        <RecordTable.InlineHead label={t('close-date')} icon={IconCalendarFilled} />
      ),
      cell: ({ row }) => {
        const closeDate = row.original.closeDate;
        return (
          <DateSelectDeal
            type="closeDate"
            value={closeDate || ''}
            id={row.original._id}
            placeholder={t('close-date')}
          />
        );
      },
      size: 240,
    },
  ];
};
