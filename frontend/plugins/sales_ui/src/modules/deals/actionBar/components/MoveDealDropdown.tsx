import { Button, DropdownMenu, toast } from 'erxes-ui';
import { memo, useState, type MouseEvent } from 'react';

import { DEAL_TOAST_OPTIONS } from '@/deals/constants/toast';
import { useDealsContext } from '@/deals/context/DealContext';
import { IconLayoutBoard } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { DealSelect } from 'ui-modules';
import { IDeal } from '@/deals/types/deals';

type TMovableDeal = Pick<IDeal, '_id' | 'boardId' | 'pipeline' | 'stageId'>;

interface MoveDealDropdownProps {
  deal: TMovableDeal;
}

const useMoveDeal = (deal: TMovableDeal) => {
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
      toast({
        title: t('deal-moved-successfully'),
        variant: 'success',
        ...DEAL_TOAST_OPTIONS,
      });
      setOpen(false);
    } finally {
      setIsMoving(false);
    }
  };

  return { open, setOpen, isMoving, handleMove };
};

const MoveDealSelect = ({
  deal,
  isMoving,
  onMove,
}: {
  deal: TMovableDeal;
  isMoving: boolean;
  onMove: (boardId: string, pipelineId: string, stageId: string) => void;
}) => (
  <DealSelect
    boardId={deal.boardId ?? undefined}
    pipelineId={deal.pipeline?._id}
    stageId={deal.stageId ?? undefined}
    onMove={onMove}
    moveLoading={isMoving}
  />
);

export const MoveDealDropdown = memo(function MoveDealDropdown({
  deal,
}: MoveDealDropdownProps) {
  const { open, setOpen, isMoving, handleMove } = useMoveDeal(deal);
  const { t } = useTranslation('sales');

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
        <MoveDealSelect deal={deal} isMoving={isMoving} onMove={handleMove} />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
});

export const MoveDealSubmenu = ({ deal }: MoveDealDropdownProps) => {
  const { open, setOpen, isMoving, handleMove } = useMoveDeal(deal);
  const { t } = useTranslation('sales');

  return (
    <DropdownMenu.Sub open={open} onOpenChange={setOpen}>
      <DropdownMenu.SubTrigger disabled={isMoving}>
        <IconLayoutBoard />
        {t('move-deal')}
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className="w-62 py-2">
          <MoveDealSelect deal={deal} isMoving={isMoving} onMove={handleMove} />
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
};
