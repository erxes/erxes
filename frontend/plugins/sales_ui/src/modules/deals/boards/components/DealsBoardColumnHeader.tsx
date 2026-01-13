import { Button, DropdownMenu, Skeleton, useConfirm } from 'erxes-ui';
import { IconArrowLeft, IconDots, IconPlus } from '@tabler/icons-react';
import { PrintDialog } from './Print';

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
import { useDealsArchive } from '@/deals/cards/hooks/useDeals';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useDeals } from '@/deals/cards/hooks/useDeals';

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

  const { deals } = useDeals({
    variables: {
      stageId: column._id,
    },
    skip: !showPrintDialog,
  });

  const { probability, name, _id, amount, unUsedAmount } = column;

  const handleArchiveStage = () => {
    confirm({
      message: `Are you sure you want to archive all cards in this list?`,
    }).then(() => {
      archiveDeals(_id);
    });
  };

  const handleArchiveList = () => {
    confirm({
      message: `Are you sure you want to archive this list?`,
    }).then(() => {
      editStage({ variables: { _id, status: 'archived' } });
    });
  };

  const handleRemoveStage = () => {
    confirm({
      message: `Are you sure you want to remove this stage?`,
    }).then(() => {
      removeStage({ variables: { _id } });
    });
  };

  const handleSortOptionClick = (sortType: string) => {
    const sortLabel =
      sortType === 'created-desc'
        ? 'Date created (Newest first)'
        : sortType === 'created-asc'
        ? 'Date created (Oldest first)'
        : sortType === 'modified-desc'
        ? 'Date modified (Newest first)'
        : sortType === 'modified-asc'
        ? 'Date modified (Oldest first)'
        : sortType === 'close-asc'
        ? 'Date assigned (Earliest first)'
        : sortType === 'close-desc'
        ? 'Date assigned (Latest first)'
        : sortType === 'alphabetically-asc'
        ? 'Alphabetically'
        : '';
    confirm({
      message: `Are you sure you want to sort this list by ${sortLabel}?`,
    }).then(() => {
      const processId = Math.random().toString();
      localStorage.setItem('processId', processId);
      sortItems(_id, sortType, processId);
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
        Back
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onClick={() => handleSortOptionClick('created-desc')}>
        Date created (Newest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('created-asc')}>
        Date created (Oldest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('modified-desc')}>
        Date modified (Newest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('modified-asc')}>
        Date modified (Oldest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('close-asc')}>
        Date assigned (Earliest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('close-desc')}>
        Date assigned (Latest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onClick={() => handleSortOptionClick('alphabetically-asc')}
      >
        Alphabetically
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
                  <DropdownMenu.Label>Stage section</DropdownMenu.Label>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    <DropdownMenu.Item onClick={handleArchiveStage}>
                      Archive All Cards in This List
                      <DropdownMenu.Shortcut>⇧⌘A</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={handleArchiveList}>
                      Archive This List
                      <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={handleRemoveStage}>
                      Remove stage
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
                      Sort By
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={(e) => {
                        e.preventDefault();
                        setShowPrintDialog(true);
                      }}
                    >
                      Print Document
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
          deals={deals || []}
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
