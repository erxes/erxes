import { Button, DropdownMenu, Separator } from 'erxes-ui';
import { memo } from 'react';

import { SelectBoardPipelineStage } from 'ui-modules/modules';
import { IDeal } from '../../types/deals';
import { IconLayoutBoard } from '@tabler/icons-react';
import { useDealsEdit } from '../../cards/hooks/useDeals';
interface MoveDealDropdownProps {
  deal: IDeal;
}
export const MoveDealDropdown = memo(function MoveDealDropdown({
  deal,
}: MoveDealDropdownProps) {
  const { editDeals } = useDealsEdit();

  return (
    <DropdownMenu>
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
        <SelectBoardPipelineStage
          boardId={deal.boardId}
          pipelineId={deal.pipeline._id}
          stageId={deal.stageId}
          mutation={editDeals}
          itemId={deal._id}
        />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
});
