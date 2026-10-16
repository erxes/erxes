import {
  useStagesEdit,
  useStagesRemove,
  useStagesSortItems,
} from '@/deals/stage/hooks/useStages';
import {
  dealCreateDefaultValuesState,
  dealCreateSheetState,
} from '@/deals/states/dealCreateSheetState';
import { IconArrowLeft, IconDots, IconPlus } from '@tabler/icons-react';
import { Button, DropdownMenu, Skeleton, useConfirm } from 'erxes-ui';

import { useDealsArchive } from '@/deals/cards/hooks/useDeals';
import { BoardDealColumn } from '@/deals/types/boards';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ItemProductProbabilities } from './ItemProductProbabilities';
import { PrintDialog } from './common/Print';

type Props = {
  column: BoardDealColumn;
  loading: boolean;
  totalCount: number;
};

export const DealsBoardColumnHeader = ({
  column,
  loading,
  totalCount,
}: Props) => {
  const [showSortOptions, setShowSortOptions] = useState(false);
  const { archiveDeals } = useDealsArchive();
  const { removeStage } = useStagesRemove();
  const { editStage } = useStagesEdit();
  const { sortItems } = useStagesSortItems();
  const { confirm } = useConfirm();
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const { probability, name, _id, amount, unUsedAmount } = column;

  const { t } = useTranslation('sales');

  const handleArchiveStage = () => {
    confirm({
      message: t('archive-all-cards-confirm'),
    }).then(() => {
      archiveDeals(_id);
    });
  };

  const handleArchiveList = () => {
    confirm({
      message: t('archive-list-confirm'),
    }).then(() => {
      editStage({ variables: { _id, status: 'archived' } });
    });
  };

  const handleRemoveStage = () => {
    confirm({
      message: t('remove-stage-confirm'),
    }).then(() => {
      removeStage({ variables: { _id } });
    });
  };

  const getSortLabel = (sortType: string) => {
    switch (sortType) {
      case 'created-desc':
        return t('sort-created-desc');
      case 'created-asc':
        return t('sort-created-asc');
      case 'modified-desc':
        return t('sort-modified-desc');
      case 'modified-asc':
        return t('sort-modified-asc');
      case 'close-asc':
        return t('sort-close-asc');
      case 'close-desc':
        return t('sort-close-desc');
      case 'alphabetically-asc':
        return t('sort-alphabetically');
      default:
        return '';
    }
  };

  const handleSortOptionClick = (sortType: string) => {
    confirm({
      message: t('sort-list-confirm', { label: getSortLabel(sortType) }),
    }).then(() => {
      sortItems(_id, sortType);
    });
    setShowSortOptions(false);
  };

  const SortMenu = () => (
    <>
      <DropdownMenu.Item
        onSelect={(e) => {
          e.preventDefault();
          setShowSortOptions(false);
        }}
      >
        <IconArrowLeft className="w-4 h-4 mr-2" />
        {t('back')}
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onClick={() => handleSortOptionClick('created-desc')}>
        {t('sort-created-desc')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('created-asc')}>
        {t('sort-created-asc')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('modified-desc')}>
        {t('sort-modified-desc')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('modified-asc')}>
        {t('sort-modified-asc')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('close-asc')}>
        {t('sort-close-asc')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('close-desc')}>
        {t('sort-close-desc')}
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onClick={() => handleSortOptionClick('alphabetically-asc')}
      >
        {t('sort-alphabetically')}
      </DropdownMenu.Item>
    </>
  );

  return (
    <div className="m-0 px-2 min-h-10 w-full font-semibold text-sm flex items-center justify-between flex-col">
      <div className="flex justify-between items-center w-full mt-1">
        <div>
          <h4 className="capitalize flex items-center gap-1 pl-1">
            {name}
            <span className="text-accent-foreground font-medium pl-1">
              {loading ? (
                <Skeleton className="size-4 rounded" />
              ) : (
                totalCount || 0
              )}
            </span>
          </h4>
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="icon" className="size-6 relative">
                <IconDots />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="w-56">
              {!showSortOptions ? (
                <>
                  <DropdownMenu.Label>{t('stage-section')}</DropdownMenu.Label>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    <DropdownMenu.Item onClick={handleArchiveStage}>
                      {t('archive-all-cards')}
                      <DropdownMenu.Shortcut>⇧⌘A</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={handleArchiveList}>
                      {t('archive-this-list')}
                      <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={handleRemoveStage}>
                      {t('remove-stage')}
                      <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    <DropdownMenu.Item
                      onSelect={(e) => {
                        e.preventDefault();
                        setShowSortOptions(true);
                      }}
                    >
                      {t('sort-by')}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={(e) => {
                        e.preventDefault();
                        setShowPrintDialog(true);
                      }}
                    >
                      {t('print-document')}
                      <DropdownMenu.Shortcut>⌘T</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </>
              ) : (
                <SortMenu />
              )}
            </DropdownMenu.Content>
          </DropdownMenu>

          <DealCreateSheetTrigger stageId={column._id} />
        </div>
      </div>
      {showPrintDialog && (
        <PrintDialog
          open={showPrintDialog}
          onClose={() => setShowPrintDialog(false)}
          stageId={column._id}
        />
      )}
      <ItemProductProbabilities
        totalAmount={amount}
        unusedTotalAmount={unUsedAmount}
        probability={probability ?? undefined}
      />
    </div>
  );
};

const DealCreateSheetTrigger = ({ stageId }: { stageId: string }) => {
  const setOpenCreateDeal = useSetAtom(dealCreateSheetState);
  const setDefaultValues = useSetAtom(dealCreateDefaultValuesState);

  const handleClick = () => {
    setDefaultValues({ stageId });
    setOpenCreateDeal(true);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <IconPlus />
    </Button>
  );
};
