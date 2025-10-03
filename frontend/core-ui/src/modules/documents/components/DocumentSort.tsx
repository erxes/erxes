import { IconSortDescending2Filled } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';

export const DocumentSort = () => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost">
            <IconSortDescending2Filled className="w-4 h-4" />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.Item>Newest First</DropdownMenu.Item>
          <DropdownMenu.Item>Oldest First</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
};
