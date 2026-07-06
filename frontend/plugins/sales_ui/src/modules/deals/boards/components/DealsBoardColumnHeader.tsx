import { Button, DropdownMenu, Skeleton, useConfirm } from 'erxes-ui';
import { IconArrowLeft, IconDots, IconPlus } from '@tabler/icons-react';
import {
  dealCreateDefaultValuesState,
  dealCreateSheetState,
} from '@/deals/states/dealCreateSheetState';
import {
  useStagesEdit,
  useStagesRemove,
  useStagesSortItems,
} from '@/deals/stage/hooks/useStages';

import { BoardDealColumn } from '@/deals/types/boards';
import ItemProductProbabilities from './ItemProductProbabilities';
import { PrintDialog } from './common/Print';
import { useDealsArchive } from '@/deals/cards/hooks/useDeals';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';


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
      message: t('archive-all-cards-confirm', 'Are you sure you want to archive all cards in this list?'),
    }).then(() => {
      archiveDeals(_id);
    });
  };

  const handleArchiveList = () => {
    confirm({
      message: t('archive-list-confirm', 'Are you sure you want to archive this list?'),
    }).then(() => {
      editStage({ variables: { _id, status: 'archived' } });
    });
  };

  const handleRemoveStage = () => {
    confirm({
      message: t('remove-stage-confirm', 'Are you sure you want to remove this stage?'),
    }).then(() => {
      removeStage({ variables: { _id } });
    });
  };

  const getSortLabel = (sortType: string) =>
    sortType === 'created-desc' ? t('sort-created-desc', 'Date created (Newest first)')
    : sortType === 'created-asc' ? t('sort-created-asc', 'Date created (Oldest first)')
    : sortType === 'modified-desc' ? t('sort-modified-desc', 'Date modified (Newest first)')
    : sortType === 'modified-asc' ? t('sort-modified-asc', 'Date modified (Oldest first)')
    : sortType === 'close-asc' ? t('sort-close-asc', 'Date assigned (Earliest first)')
    : sortType === 'close-desc' ? t('sort-close-desc', 'Date assigned (Latest first)')
    : sortType === 'alphabetically-asc' ? t('sort-alphabetically', 'Alphabetically')
    : '';

  const handleSortOptionClick = (sortType: string) => {
    confirm({
      message: t('sort-list-confirm', 'Are you sure you want to sort this list by {{label}}?', { label: getSortLabel(sortType) }),
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
        {t('back', 'Back')}
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onClick={() => handleSortOptionClick('created-desc')}>
        {t('sort-created-desc', 'Date created (Newest first)')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('created-asc')}>
        {t('sort-created-asc', 'Date created (Oldest first)')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('modified-desc')}>
        {t('sort-modified-desc', 'Date modified (Newest first)')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('modified-asc')}>
        {t('sort-modified-asc', 'Date modified (Oldest first)')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('close-asc')}>
        {t('sort-close-asc', 'Date assigned (Earliest first)')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('close-desc')}>
        {t('sort-close-desc', 'Date assigned (Latest first)')}
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onClick={() => handleSortOptionClick('alphabetically-asc')}
      >
        {t('sort-alphabetically', 'Alphabetically')}
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
                  <DropdownMenu.Label>{t('stage-section', 'Stage section')}</DropdownMenu.Label>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    <DropdownMenu.Item onClick={handleArchiveStage}>
                      {t('archive-all-cards', 'Archive All Cards in This List')}
                      <DropdownMenu.Shortcut>⇧⌘A</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={handleArchiveList}>
                      {t('archive-this-list', 'Archive This List')}
                      <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={handleRemoveStage}>
                      {t('remove-stage', 'Remove stage')}
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
                      {t('sort-by', 'Sort By')}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={(e) => {
                        e.preventDefault();
                        setShowPrintDialog(true);
                      }}
                    >
                      {t('print-document', 'Print Document')}
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
        totalAmount={amount as Record<string, number> | undefined}
        unusedTotalAmount={unUsedAmount as Record<string, number> | undefined}
        probability={probability}
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
