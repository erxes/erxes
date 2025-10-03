import { Button, DropdownMenu } from 'erxes-ui';

import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { SalesFilter } from './SalesFilter';

const MainActionBar = () => {
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <SalesFilter />

      <div className="gap-2">
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button className="flex-none pr-2" variant="outline">
              <IconAdjustmentsHorizontal className="w-4 h-4" /> Display
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Resolve</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MainActionBar;
