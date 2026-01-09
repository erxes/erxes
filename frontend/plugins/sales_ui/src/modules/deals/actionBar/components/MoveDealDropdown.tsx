import { Button, DropdownMenu, Separator } from 'erxes-ui';
import {
  dealBoardState,
  dealPipelineState,
} from '@/deals/states/dealContainerState';
import { memo, useEffect } from 'react';

import {
  BoardCell,
  PipelineCell,
  StageCell,
} from '@/deals/components/deal-selects/MoveDealSelect';
import { IDeal } from '../../types/deals';
import { IconLayoutBoard } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
interface MoveDealDropdownProps {
  deal: IDeal;
}
export const MoveDealDropdown = memo(function MoveDealDropdown({
  deal,
}: MoveDealDropdownProps) {
  const setBoardId = useSetAtom(dealBoardState);
  const setPipelineId = useSetAtom(dealPipelineState);

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
        <div className="flex flex-col">
          <div className="px-4 py-1">
            <span className=" text-xs text-gray-400">BOARD</span>
          </div>
          <div className="px-2">
            <BoardCell
              deal={deal}
              className="border-none shadow-none h-8 font-normal hover:bg-accent/50 selection:bg-transparent"
            />
          </div>
          <Separator className="mt-2 mb-1" />

          <div className="px-4 py-1 mt-1">
            <span className=" text-xs  text-gray-400">PIPELINE</span>
          </div>
          <div className="px-2">
            <PipelineCell
              deal={deal}
              className="border-none shadow-none h-8 font-normal px-2 hover:bg-accent/50 w-full justify-between"
            />
          </div>
          <Separator className="mt-2 mb-1" />

          <div className="px-4 py-1 mt-1">
            <span className="text-xs  text-gray-400">STAGE</span>
          </div>
          <div className="px-2">
            <StageCell
              deal={deal}
              className="border-none shadow-none h-8 font-normal px-2 hover:bg-accent/50 w-full justify-between"
            />
          </div>
          <Separator className="mt-2" />
        </div>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
});
