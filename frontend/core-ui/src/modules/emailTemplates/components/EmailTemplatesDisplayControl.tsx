import {
  emailTemplatesLayoutState,
  TEmailTemplatesLayout,
} from '@/emailTemplates/states/emailTemplatesLayoutState';
import {
  IconAdjustmentsHorizontal,
  IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';
import { Button, Popover, PopoverScoped, ToggleGroup } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useState } from 'react';

const LAYOUTS: TEmailTemplatesLayout[] = ['list', 'grid'];

export const useEmailTemplatesLayout = () => {
  const [layout, setLayout] = useAtom(emailTemplatesLayoutState);

  return { layout, setLayout };
};

export const EmailTemplatesDisplayControl = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { layout, setLayout } = useEmailTemplatesLayout();

  const handleValueChange = (value: string) => {
    if (!LAYOUTS.includes(value as TEmailTemplatesLayout)) {
      return;
    }

    setLayout(value as TEmailTemplatesLayout);
    setIsOpen(false);
  };

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
          className="grid grid-cols-2 gap-2"
          value={layout}
          onValueChange={handleValueChange}
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
