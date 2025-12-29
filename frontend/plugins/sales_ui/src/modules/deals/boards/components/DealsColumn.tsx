import {
  IconAlertSquareRounded,
  IconCalendarFilled,
  IconLabelFilled,
  IconProgressCheck,
  IconUser,
} from '@tabler/icons-react';
import { RecordTable, RecordTableInlineCell, useQueryState } from 'erxes-ui';
import {
  dealBoardState,
  dealPipelineState,
} from '@/deals/states/dealContainerState';
import { useAtomValue, useSetAtom } from 'jotai';

import { ColumnDef } from '@tanstack/table-core';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { IDeal } from '@/deals/types/deals';
import { SelectAssigneeDeal } from '@/deals/components/deal-selects/SelectAssigneeDeal';
import { SelectBoard } from '@/deals/boards/components/SelectBoards';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { SelectPipeline } from '@/deals/pipelines/components/SelectPipelines';
import { SelectStage } from '@/deals/stage/components/SelectStages';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';

const NameCell = ({ deal }: { deal: IDeal }) => {
  const setActiveDealId = useSetAtom(dealDetailSheetState);
  const [, setSalesItemId] = useQueryState<string>('salesItemId');

  const handleClick = () => {
    setSalesItemId(deal._id);
    setActiveDealId(deal._id);
  };

  return (
    <RecordTableInlineCell onClick={handleClick}>
      <div className="flex items-center justify-between w-full gap-2">
        <span>{deal.name}</span>
        {deal.status === 'archived' && (
          <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-amber-100/80 text-amber-900 border border-amber-200/50 rounded-sm">
            Archived
          </span>
        )}
      </div>
    </RecordTableInlineCell>
  );
};

const BoardCell = ({ deal }: { deal: IDeal }) => {
  const setBoardId = useSetAtom(dealBoardState);

  return (
    <SelectBoard
      value={deal.boardId}
      onValueChange={(boardId) => {
        setBoardId({
          boardId: boardId as string,
        });
      }}
    />
  );
};

const PipelineCell = ({ deal }: { deal: IDeal }) => {
  const setPipelineId = useSetAtom(dealPipelineState);
  const board = useAtomValue(dealBoardState);

  const boardId = board.boardId || deal.boardId;

  return (
    <SelectPipeline.InlineCell
      mode="single"
      value={deal.pipeline?._id}
      boardId={boardId}
      onValueChange={(pipelineId) => {
        setPipelineId({
          pipelineId: pipelineId as string,
        });
      }}
    />
  );
};

const ProductsCell = ({ deal }: { deal: IDeal }) => {
  console.log(deal.products);
  return (
    <RecordTableInlineCell>
      <div className="flex items-center justify-between w-full gap-2">
        <span>{deal.products?.length}</span>
      </div>
    </RecordTableInlineCell>
  );
};

const StageCell = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsEdit();

  const board = useAtomValue(dealBoardState);
  const pipeline = useAtomValue(dealPipelineState);

  const pipelineId = pipeline.pipelineId || deal.pipeline?._id;

  return (
    <SelectStage.InlineCell
      mode="single"
      value={deal.stage?._id}
      pipelineId={pipelineId}
      onValueChange={(stageId) => {
        editDeals({
          variables: {
            _id: deal._id,
            boardId: board.boardId || deal.boardId,
            pipelineId: pipeline.pipelineId || deal.pipeline?._id,
            stageId: stageId as string,
          },
        });
      }}
    />
  );
};

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
          />
        );
      },
      size: 240,
    },
  ];
};
