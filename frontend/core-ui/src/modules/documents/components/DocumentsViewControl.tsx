import {
  IconAdjustmentsHorizontal,
  IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';
import { Button, Popover, PopoverScoped, ToggleGroup } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useState } from 'react';

import { documentsViewAtom } from '../states/documentsViewState';

export const DocumentsViewControl = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useAtom(documentsViewAtom);

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconAdjustmentsHorizontal />
          Display
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <ToggleGroup
          type="single"
          defaultValue={view}
          className="grid grid-cols-2 gap-2"
          value={view}
          onValueChange={(value) => {
            setView(value as 'list' | 'grid');
            setIsOpen(false);
          }}
        >
          <ToggleGroup.Item value="list" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0 border"
            >
              <IconList className="size-5!" />
              <span className="text-xs font-normal">List</span>
            </Button>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="grid" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0 border"
            >
              <IconLayoutGrid className="size-5!" />
              <span className="text-xs font-normal">Grid</span>
            </Button>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Popover.Content>
    </PopoverScoped>
  );
};
