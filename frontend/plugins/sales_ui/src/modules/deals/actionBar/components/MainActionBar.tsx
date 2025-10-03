import { Button, DropdownMenu } from 'erxes-ui';
import { IconAdjustmentsHorizontal, IconFilter } from '@tabler/icons-react';

import { ActionBarFilters } from '../constants/Filters';
import DropdownItem from './DropdownItem';
import React from 'react';

const MainActionBar = () => {
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <div className="flex items-center gap-2 bg-sidebar cursor-pointer">
            <IconFilter className="w-4 h-4" /> Filter
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {ActionBarFilters.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              <DropdownMenu.Group>
                {group.map((filter, itemIndex) => (
                  <DropdownItem
                    key={itemIndex}
                    item={filter}
                    itemIndex={itemIndex}
                  />
                ))}
              </DropdownMenu.Group>
              {groupIndex < ActionBarFilters.length - 1 && (
                <DropdownMenu.Separator />
              )}
            </React.Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>

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
