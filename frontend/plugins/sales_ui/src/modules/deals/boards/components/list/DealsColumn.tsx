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
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';

export const DealsColumn = (): ColumnDef<IDeal>[] => {
  const { editDeals } = useDealsEdit();
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
      id: 'number',
      accessorKey: 'number',
      header: () => (
        <RecordTable.InlineHead label="Number" icon={IconLabelFilled} />
      ),
      cell: ({ row }) => <NumberCell deal={row.original} />,
    },
    {
      id: 'boardId',
      accessorFn: (row) => row.boardId,
      header: () => (
        <RecordTable.InlineHead label="Board" icon={IconLabelFilled} />
      ),
      cell: ({ row }) => <BoardSelect boardId={row.original.boardId} />,
    },
    {
      id: 'pipeline',
      accessorFn: (row) => row.pipeline?.name,
      header: () => (
        <RecordTable.InlineHead label="Pipeline" icon={IconProgressCheck} />
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
        <RecordTable.InlineHead label="Stage" icon={IconProgressCheck} />
      ),
      cell: ({ row }) => {
        return (
          <StageSelect
            stageId={row.original.stageId}
            pipelineId={row.original.pipeline?._id || ''}
            onChange={(stageId) => {
              editDeals({
                variables: {
                  _id: row.original._id,
                  boardId: row.original.boardId,
                  pipelineId: row.original.pipelineId,
                  stageId: stageId as string,
                },
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
