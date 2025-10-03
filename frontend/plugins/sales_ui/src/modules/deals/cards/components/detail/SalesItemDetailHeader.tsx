import { Button, DropdownMenu, Sheet } from 'erxes-ui';
import {
  IconArchive,
  IconCopy,
  IconDotsVertical,
  IconEye,
  IconLayoutSidebarLeftCollapse,
  IconPrinter,
} from '@tabler/icons-react';

import { IDeal } from '@/deals/types/deals';

export const SalesItemDetailHeader = ({ deal }: { deal: IDeal }) => {
  return (
    <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
      <Button variant="ghost" size="icon">
        <IconLayoutSidebarLeftCollapse />
      </Button>
      <Sheet.Title className="shrink-0">
        {deal?.name || 'Untitled deal'}
      </Sheet.Title>
      <div className="flex items-center w-full justify-end">
        <DropdownMenu>
          <DropdownMenu.Trigger>
            <Button variant="outline" className="flex items-center gap-2">
              <IconDotsVertical />
              Edit
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="w-48 !min-w-fit">
            <DropdownMenu.Item>
              <IconCopy />
              Copy
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <IconEye />
              Watch
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <IconPrinter />
              Print document
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <IconArchive />
              Archive
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
      <Sheet.Close />
    </Sheet.Header>
  );
};
