import { Button, DropdownMenu, Separator, Switch } from 'erxes-ui';
import {
  IconAdjustmentsHorizontal,
  IconAlignLeft2,
  IconArrowsUpDown,
  IconBaselineDensityMedium,
  IconCaretDownFilled,
  IconLayoutBoardSplit,
  IconList,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { SalesFilter } from './SalesFilter';
import { useState } from 'react';

const buttons: string[] = ['Id', 'Status', 'Assignee'];

const MainActionBar = () => {
  const [dir, setDir] = useState<string>('desc');
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

          <DropdownMenu.Content className="w-[260px] p-2">
            <div className="flex gap-2 mb-2">
              <Button variant="outline" size="sm" className="flex-1">
                <IconList />
                List
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <IconLayoutBoardSplit />
                Board
              </Button>
            </div>

            <Separator className="my-2" />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <IconBaselineDensityMedium className="size-4" />
                  Grouping
                </span>
                <Button variant="outline" size="sm">
                  Status <IconCaretDownFilled className="size-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <IconAlignLeft2 size={19} />
                  Sub-grouping
                </span>
                <Button variant="outline" size="sm">
                  No grouping <IconCaretDownFilled className="ml-1" />
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <IconArrowsUpDown className="size-4" />
                  Ordering
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Priority <IconCaretDownFilled className="ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setDir((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                    }
                  >
                    {dir === 'desc' ? (
                      <IconSortDescending />
                    ) : (
                      <IconSortAscending />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Order completed by recency</span>
                <Switch onClick={(e) => e.stopPropagation()} />
              </div>
            </div>
            <Separator className="my-2" />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Completed issues</span>
                <Button variant="outline" size="sm">
                  All <IconCaretDownFilled className="ml-1" />
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span>Show sub-issues</span>
                <Switch defaultChecked onClick={(e) => e.stopPropagation()} />
              </div>
            </div>
            <Separator className="my-2" />
            <div className="space-y-2">
              <p className="font-medium mb-2">Link</p>
              <div className="flex justify-between items-center">
                <span>Show empty group</span>
                <Switch onClick={(e) => e.stopPropagation()} />
              </div>
              <p className="font-medium mb-1">Display properties</p>
              <div className="flex flex-wrap gap-2">
                {buttons.map((button) => (
                  <Button
                    key={button}
                    variant="outline"
                    size="sm"
                    className="capitalize"
                  >
                    {button}
                  </Button>
                ))}
              </div>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MainActionBar;
