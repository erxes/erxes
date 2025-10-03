import { Button, DropdownMenu, Sheet, useQueryState } from 'erxes-ui';
import { IconDots, IconPlus } from '@tabler/icons-react';

import { AddCardForm } from '@/deals/cards/components/AddCardForm';
import { IStage } from '@/deals/types/stages';
import { useState } from 'react';

type Props = {
  stage: IStage;
};

export const StageHeader = ({ stage = {} as IStage }: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [, setStageId] = useQueryState<string | null>('stageId');

  const { probability, itemsTotalCount, name } = stage;

  const onSheetChange = () => {
    setOpen(!open);
    setStageId(!open ? stage._id : null);
  };

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
            <DropdownMenu.Label>Stage section</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
              <DropdownMenu.Item>
                Archive All Cards in This List
                <DropdownMenu.Shortcut>⇧⌘A</DropdownMenu.Shortcut>
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                Archive This List
                <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                Remove stage
                <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
              </DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
              <DropdownMenu.Item>Sort By</DropdownMenu.Item>
              <DropdownMenu.Item>
                Print Document
                <DropdownMenu.Shortcut>⌘+T</DropdownMenu.Shortcut>
              </DropdownMenu.Item>
            </DropdownMenu.Group>
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
