import {
  IconAlertSquareRounded,
  IconCalendarFilled,
  IconLabelFilled,
  IconProgressCheck,
  IconUser,
} from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';

import { ColumnDef } from '@tanstack/table-core';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { IDeal } from '@/deals/types/deals';
import { SelectAssigneeDeal } from '@/deals/components/deal-selects/SelectAssigneeDeal';

import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';

import {
  BoardCell,
  PipelineCell,
  StageCell,
  NameCell,
  ProductsCell,
} from '@/deals/components/deal-selects/MoveDealSelect';

export const DealsColumn = (): ColumnDef<IDeal>[] => {
  const checkBoxColumn = RecordTable.checkboxColumn as ColumnDef<IDeal>;

  return [
    checkBoxColumn,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => (
        <RecordTable.InlineHead label="Name" icon={IconLabelFilled} />
      ),
      cell: ({ row }) => <NameCell deal={row.original} />,
      size: 240,
    },
    {
      id: 'boardId',
      accessorFn: (row) => row.boardId,
      header: () => (
        <RecordTable.InlineHead label="Board" icon={IconLabelFilled} />
      ),
      cell: ({ row }) => <BoardCell deal={row.original} />,
    },
    {
      id: 'pipeline',
      accessorFn: (row) => row.pipeline?.name,
      header: () => (
        <RecordTable.InlineHead label="Pipeline" icon={IconProgressCheck} />
      ),
      cell: ({ row }) => <PipelineCell deal={row.original} />,
      size: 170,
    },
    {
      id: 'stage',
      accessorFn: (row) => row.stage?.name,
      header: () => (
        <RecordTable.InlineHead label="Stage" icon={IconProgressCheck} />
      ),
      cell: ({ row }) => <StageCell deal={row.original} />,
      size: 170,
    },
    {
      id: 'products',
      accessorFn: (row) => row.products,
      header: () => (
        <RecordTable.InlineHead label="Products" icon={IconProgressCheck} />
      ),
      cell: ({ row }) => <ProductsCell deal={row.original} />,
    },
    {
      id: 'assignedUsers',
      accessorKey: 'assignedUserIds',
      header: () => <RecordTable.InlineHead label="Assignee" icon={IconUser} />,
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
          label="Priority"
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
        <RecordTable.InlineHead label="Start Date" icon={IconCalendarFilled} />
      ),
      cell: ({ row }) => {
        const startDate = row.original.startDate;
        return (
          <DateSelectDeal
            type="startDate"
            value={startDate || ''}
            id={row.original._id}
            placeholder="Start Date"
          />
        );
      },
      size: 240,
    },
    {
      id: 'closeDate',
      accessorKey: 'closeDate',
      header: () => (
        <RecordTable.InlineHead label="Close Date" icon={IconCalendarFilled} />
      ),
      cell: ({ row }) => {
        const closeDate = row.original.closeDate;
        return (
          <DateSelectDeal
            type="closeDate"
            value={closeDate || ''}
            id={row.original._id}
            placeholder="Close Date"
          />
        );
      },
      size: 240,
    },
  ];
};
