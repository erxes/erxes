import { Button, DropdownMenu, Input, Sheet } from 'erxes-ui';
import {
  IconArchive,
  IconCopy,
  IconDotsVertical,
  IconEye,
  IconLayoutSidebarLeftCollapse,
  IconPrinter,
} from '@tabler/icons-react';

import { IDeal } from '@/deals/types/deals';
import { useDealsContext } from '@/deals/context/DealContext';
import { useState } from 'react';

export const SalesItemDetailHeader = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsContext();
  const [name, setName] = useState(deal?.name || 'Untitled deal');

  const handleName = () => {
    if (!name) return;

    editDeals({
      variables: {
        _id: deal._id,
        name,
      },
    });
  };

  return (
    <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
      <Button variant="ghost" size="icon">
        <IconLayoutSidebarLeftCollapse />
      </Button>
      <Sheet.Title className="shrink-0 w-4/5">
        <Input
          className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
          placeholder="Deal Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onBlur={handleName}
        />
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
