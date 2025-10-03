import {
  Button,
  DropdownMenu,
  Sheet,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { IconArrowLeft, IconDots, IconPlus } from '@tabler/icons-react';
import {
  useStagesEdit,
  useStagesRemove,
  useStagesSortItems,
} from '@/deals/stage/hooks/useStages';

import { AddCardForm } from '@/deals/cards/components/AddCardForm';
import { IStage } from '@/deals/types/stages';
import { useDealsArchive } from '@/deals/cards/hooks/useDeals';
import { useState } from 'react';

type Props = {
  stage: IStage;
};

export const StageHeader = ({ stage = {} as IStage }: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [, setStageId] = useQueryState<string | null>('stageId');
  const { archiveDeals } = useDealsArchive();
  const { removeStage } = useStagesRemove();
  const { editStage } = useStagesEdit();
  const { sortItems } = useStagesSortItems();
  const { confirm } = useConfirm();

  const { probability, itemsTotalCount, name } = stage;

  const onSheetChange = () => {
    setOpen(!open);
    setStageId(!open ? stage._id : null);
  };

  const handleArchiveStage = () => {
    confirm({
      message: `Are you sure you want to archive all cards in this list?`,
    }).then(() => {
      archiveDeals({ variables: { stageId: stage._id } });
    });
  };

  const handleArchiveList = () => {
    confirm({
      message: `Are you sure you want to archive this list?`,
    }).then(() => {
      editStage({ variables: { _id: stage._id, status: 'archived' } });
    });
  };

  const handleRemoveStage = () => {
    confirm({
      message: `Are you sure you want to remove this stage?`,
    }).then(() => {
      removeStage({ variables: { _id: stage._id } });
    });
  };

  const handleSortOptionClick = (sortType: string) => {
    confirm({
      message: `Are you sure you want to sort this list by ${sortType}?`,
    }).then(() => {
      sortItems({ variables: { stageId: stage._id, sortType } });
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
    <div className="flex justify-between items-center p-2">
      <div>
        <h4 className="font-semibold flex items-center gap-2">
          {name}
          <span className="text-xs text-gray-400">{itemsTotalCount || 0}</span>
        </h4>
        {probability && (
          <span className="text-xs text-gray-400">
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

        <Sheet open={open} onOpenChange={onSheetChange} data-no-dnd="true">
          <Sheet.Trigger asChild>
            <Button variant="ghost" size="icon" className="size-6 relative">
              <IconPlus />
            </Button>
          </Sheet.Trigger>
          <Sheet.View
            className="sm:max-w-lg p-0"
            onEscapeKeyDown={(e) => {
              e.preventDefault();
            }}
          >
            <AddCardForm onCloseSheet={onSheetChange} />
          </Sheet.View>
        </Sheet>
      </div>
    </div>
  );
};
