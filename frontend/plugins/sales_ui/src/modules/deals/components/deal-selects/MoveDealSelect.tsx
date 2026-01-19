import { RecordTableInlineCell, useQueryState } from 'erxes-ui';
import {
  dealBoardState,
  dealPipelineState,
} from '@/deals/states/dealContainerState';
import { useAtomValue, useSetAtom } from 'jotai';

import { IDeal } from '@/deals/types/deals';
import { SelectBoard } from '~/modules/deals/boards/components/common/SelectBoards';
import { SelectPipeline } from '@/deals/pipelines/components/SelectPipelines';
import { SelectStage } from '@/deals/stage/components/SelectStages';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';

export const BoardCell = ({
  deal,
  className,
}: {
  deal: IDeal;
  className?: string;
}) => {
  const setBoardId = useSetAtom(dealBoardState);

  return (
    <SelectBoard
      value={deal.boardId}
      className={className}
      onValueChange={(boardId) => {
        setBoardId({
          boardId: boardId as string,
        });
      }}
    />
  );
};

export const PipelineCell = ({
  deal,
  className,
}: {
  deal: IDeal;
  className?: string;
}) => {
  const setPipelineId = useSetAtom(dealPipelineState);
  const board = useAtomValue(dealBoardState);

  const boardId = board.boardId || deal.boardId;

  return (
    <SelectPipeline.InlineCell
      value={deal.pipeline?._id}
      boardId={boardId}
      className={className}
      onValueChange={(pipelineId) => {
        setPipelineId({
          pipelineId: pipelineId as string,
        });
      }}
    />
  );
};

export const StageCell = ({
  deal,
  className,
}: {
  deal: IDeal;
  className?: string;
}) => {
  const { editDeals } = useDealsEdit();

  const board = useAtomValue(dealBoardState);
  const pipeline = useAtomValue(dealPipelineState);

  const pipelineId = pipeline.pipelineId || deal.pipeline?._id;

  return (
    <SelectStage.InlineCell
      mode="single"
      value={deal.stage?._id}
      pipelineId={pipelineId}
      className={className}
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
export const NameCell = ({ deal }: { deal: IDeal }) => {
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
export const ProductsCell = ({ deal }: { deal: IDeal }) => {
  return (
    <RecordTableInlineCell>
      <div className="flex items-center justify-between w-full gap-2">
        <span>{deal.products?.length}</span>
      </div>
    </RecordTableInlineCell>
  );
};
