import { Button, DropdownMenu } from 'erxes-ui';
import {
  dealBoardState,
  dealPipelineState,
} from '@/deals/states/dealContainerState';
import { memo, useState } from 'react';

import { DealSelect } from 'ui-modules';
import { IDeal } from '../../types/deals';
import { IconLayoutBoard } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';

interface MoveDealDropdownProps {
  deal: IDeal;
}

export const MoveDealDropdown = memo(function MoveDealDropdown({
  deal,
}: MoveDealDropdownProps) {
  const { editDeals } = useDealsEdit();

  const board = useAtomValue(dealBoardState);
  const pipeline = useAtomValue(dealPipelineState);

  const pipelineId = pipeline.pipelineId || deal.pipeline?._id;
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <IconLayoutBoard size={16} />
          Move Deal
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-62 py-2">
        <DealSelect
          boardId={deal.boardId}
          pipelineId={pipelineId}
          stageId={deal.stageId}
          onChangeStage={(stageId, callback) => {
            editDeals({
              variables: {
                _id: deal._id,
                boardId: board.boardId || deal.boardId,
                pipelineId,
                stageId: stageId as string,
              },
              onCompleted: () => {
                setOpen(false);
                callback?.();
              },
            });
          }}
        />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
});
