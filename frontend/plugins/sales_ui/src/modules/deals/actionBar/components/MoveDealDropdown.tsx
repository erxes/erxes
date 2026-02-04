import { Button, DropdownMenu } from 'erxes-ui';

import { DealSelect } from 'ui-modules';
import { IDeal } from '../../types/deals';
import { IconLayoutBoard } from '@tabler/icons-react';
import { memo } from 'react';

interface MoveDealDropdownProps {
  deal: IDeal;
}

export const MoveDealDropdown = memo(function MoveDealDropdown({
  deal,
}: MoveDealDropdownProps) {
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
        <DealSelect
          boardId={deal.boardId}
          pipelineId={deal.pipeline._id}
          stageId={deal.stageId}
        />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
});
