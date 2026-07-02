import { Button, DropdownMenu, toast } from 'erxes-ui';
import { memo, useState, type MouseEvent } from 'react';

import { DealSelect } from 'ui-modules';
import { IDeal } from '../../types/deals';
import { IconLayoutBoard } from '@tabler/icons-react';
import { useDealsContext } from '@/deals/context/DealContext';
import { useTranslation } from 'react-i18next';

interface MoveDealDropdownProps {
  deal: IDeal;
}

export const MoveDealDropdown = memo(function MoveDealDropdown({
  deal,
}: MoveDealDropdownProps) {
  const { editDeals } = useDealsContext();
  const [open, setOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const { t } = useTranslation('sales');

  const handleMove = async (
    _boardId: string,
    _pipelineId: string,
    stageId: string,
  ) => {
    setIsMoving(true);
    try {
      await editDeals({
        variables: {
          _id: deal._id,
          stageId,
        },
      });
      toast({ title: t('deal-moved-successfully'), variant: 'success' });
      setOpen(false);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={(e: MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
        >
          <IconLayoutBoard size={16} />
          {t('move-deal')}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-62 py-2">
        <DealSelect
          boardId={deal.boardId}
          pipelineId={deal.pipeline?._id}
          stageId={deal.stageId}
          onMove={handleMove}
          moveLoading={isMoving}
        />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
});
