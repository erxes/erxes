/* eslint-disable react-hooks/rules-of-hooks */
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell, RecordTableTree } from 'erxes-ui';
import {
  IconLabelFilled,
  IconProgressCheck,
  IconUser,
  IconAlertSquareRounded,
  IconCalendarFilled,
} from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { SelectAssigneeDeal } from '@/deals/components/deal-selects/SelectAssigneeDeal';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { SelectPipeline } from '../../pipelines/components/SelectPipelines';
import { SelectStage } from '../../stage/components/SelectStages';
import { SelectBoard } from '@/deals/boards/components/SelectBoards';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { IDeal } from '../../types/deals';
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
      cell: ({ cell }) => {
        const name = cell.getValue() as string;
        const setActiveDeal = useSetAtom(dealDetailSheetState);
        return (
          <RecordTableTree.Trigger
            order={String(cell.row.original.order)}
            name={name}
            hasChildren={false}
            className="pl-2"
          >
            <RecordTableInlineCell.Anchor
              onClick={() => setActiveDeal(cell.row.original._id)}
            >
              {name}
            </RecordTableInlineCell.Anchor>
          </RecordTableTree.Trigger>
        );
      },
      size: 240,
    },
    {
      id: 'board',
      accessorKey: 'boardId',
      header: () => (
        <RecordTable.InlineHead label="Board" icon={IconProgressCheck} />
      ),
      cell: ({ cell }) => {
        const { editDeals } = useDealsEdit();
        return (
          <SelectBoard.InlineCell
            mode="single"
            value={cell.row.original.boardId}
            onValueChange={(boardId) => {
              editDeals({
                variables: {
                  _id: cell.row.original._id,
                  boardId: boardId as string,
                },
              });
            }}
          />
        );
      },
      size: 170,
    },
    {
      id: 'pipeline',
      accessorFn: (row) => row.pipeline?.name,
      header: () => (
        <RecordTable.InlineHead label="Pipeline" icon={IconProgressCheck} />
      ),
      cell: ({ cell }) => {
        const { editDeals } = useDealsEdit();
        return (
          <SelectPipeline.InlineCell
            mode="single"
            value={cell.row.original.pipeline?._id}
            onValueChange={(pipelineId) => {
              editDeals({
                variables: {
                  _id: cell.row.original._id,
                  pipelineId: pipelineId as string,
                },
              });
            }}
          />
        );
      },
      size: 170,
    },

    {
      id: 'assignedUsers',
      accessorKey: 'assignedUserIds',
      header: () => <RecordTable.InlineHead label="Assignee" icon={IconUser} />,
      cell: ({ cell }) => {
        return (
          <SelectAssigneeDeal
            variant="table"
            id={cell.row.original._id}
            value={cell.row.original.assignedUserIds || []}
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
          <SelectDealPriority
            value={cell.row.original.priority || ''}
            variant="table"
            dealId={cell.row.original._id}
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
          <DateSelectDeal
            type="startDate"
            value={startDate || ''}
            id={cell.row.original._id}
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
      cell: ({ cell }) => {
        const closeDate = cell.getValue() as string;
        return (
          <DateSelectDeal
            type="closeDate"
            value={closeDate || ''}
            id={cell.row.original._id}
          />
        );
      },
      size: 240,
    },
  ];
};
