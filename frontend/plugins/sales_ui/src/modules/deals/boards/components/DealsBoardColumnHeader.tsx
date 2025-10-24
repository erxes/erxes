import {
  Board,
  BoardColumnProps,
  Button,
  DropdownMenu,
  Skeleton,
  useConfirm,
} from 'erxes-ui';
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

import { useDealsArchive } from '@/deals/cards/hooks/useDeals';
import { useSetAtom } from 'jotai';
import { useState } from 'react';

type Props = {
  column: BoardColumnProps;
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

  const { probability, name, id } = column;

  const handleArchiveStage = () => {
    confirm({
      message: `Are you sure you want to archive all cards in this list?`,
    }).then(() => {
      archiveDeals(id);
    });
  };

  const handleArchiveList = () => {
    confirm({
      message: `Are you sure you want to archive this list?`,
    }).then(() => {
      editStage({ variables: { _id: id, status: 'archived' } });
    });
  };

  const handleRemoveStage = () => {
    confirm({
      message: `Are you sure you want to remove this stage?`,
    }).then(() => {
      removeStage({ variables: { _id: id } });
    });
  };

  const handleSortOptionClick = (sortType: string) => {
    confirm({
      message: `Are you sure you want to sort this list by ${sortType}?`,
    }).then(() => {
      sortItems(id, sortType);
    });
    setShowSortOptions(false);
  };

  const SortMenu = () => (
    <>
      <DropdownMenu.Item onClick={() => setShowSortOptions(false)}>
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
    <Board.Header>
      <div className="py-2">
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
        {probability && (
          <span className="text-xs text-gray-400 pl-1">
            Forecasted ({probability})
          </span>
        )}
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
                  <DropdownMenu.Item onClick={() => setShowSortOptions(true)}>
                    Sort By
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    Print Document
                    <DropdownMenu.Shortcut>⌘+T</DropdownMenu.Shortcut>
                  </DropdownMenu.Item>
                </DropdownMenu.Group>
              </>
            ) : (
              <SortMenu />
            )}
          </DropdownMenu.Content>
        </DropdownMenu>

        <DealCreateSheetTrigger stageId={column.id} />
      </div>
    </Board.Header>
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
