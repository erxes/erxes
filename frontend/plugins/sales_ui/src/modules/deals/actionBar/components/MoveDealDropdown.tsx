import { Button, DropdownMenu } from 'erxes-ui';
import { dealPipelineState } from '@/deals/states/dealContainerState';
import { memo, useState, type MouseEvent } from 'react';

import { DealSelect } from 'ui-modules';
import { IDeal } from '../../types/deals';
import { IconLayoutBoard } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';

interface MoveDealDropdownProps {
  deal: IDeal;
}

export const MoveDealDropdown = memo(function MoveDealDropdown({
  deal,
}: MoveDealDropdownProps) {
  const pipeline = useAtomValue(dealPipelineState);

  const pipelineId = pipeline.pipelineId || deal.pipeline?._id;
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={(e: MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
        >
          <IconLayoutBoard size={16} />
          Move Deal
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-62 py-2">
        <DealSelect
          boardId={deal.boardId}
          pipelineId={pipelineId}
        />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
});
