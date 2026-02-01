import { Button, Popover, Command, useFilterContext, Input } from 'erxes-ui';
import { IconArrowLeft, IconCirclePlus } from '@tabler/icons-react';
import { useState } from 'react';

const allFilters = [
  'Parent ID',
  'Created at',
  'Name',
  'Start date',
  'Close date',
  'Stage changed date',
  'Reminder minute',
  'Is complete',
  'Description',
  'Modified at',
  'Priority',
  'Status',
  'Score',
  'Item number',
  'Source',
  'Modified by',
  'Watched users',
  'Customers',
  'Companies',
  'Branches',
  'Departments',
  'Tags',
  'Assigned to',
  'Stage',
  'Labels',
  'Product',
  'Product categories',
];

function AdvancedFilter() {
  const { setView } = useFilterContext();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [option, setOption] = useState<string | null>(null);
  const [value, setValue] = useState<string>('');
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [filterData, setFilterData] = useState<any>(null);

  const onSelect = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleBack = () => {
    setSelectedFilter(null);
  };

  const FilterButton = (filter: string, option: any, value: string) => {
    setFilterData({ filter, option, value });
    setIsApplied(true);
  };

  const finalFilter = () => {
    // TODO: Implement final filter logic
    console.log('Final filter:', filterData);
  };

  if (isApplied) {
    return (
      <Popover.Content align="start" className="p-1 space-y-2">
        <Command className=" space-y-2">
          <button
            onClick={() => setIsApplied(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2"
          >
            <IconArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex flex-col items-start gap-2 border rounded-md p-2 space-y-2">
            <div className="flex flex-col items-start gap-2 border rounded-md p-2 space-y-2">
              <p className="text-sm py-4 px-2 space-y-2">
                Sales:deal's {filterData?.filter} {filterData?.option}{' '}
                {filterData?.value}
              </p>
              <Button className="text-sm">
                <IconCirclePlus />
                Add Property
              </Button>
            </div>
            <Button className="text-sm">
              <IconCirclePlus />
              Add New Group
            </Button>
          </div>
          <div className="w-full flex justify-end">Items found: 0</div>
        </Command>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" className="text-sm">
            Cancel
          </Button>
          <Button className="text-sm">Count</Button>
          <Button className="text-sm" onClick={() => finalFilter()}>
            Filter
          </Button>
        </div>
      </Popover.Content>
    );
  }

  if (selectedFilter) {
    const filterOptions = [
      'Equals to',
      'Is not equal to',
      'Contains with',
      'Does not contain with',
      'Is set',
      'Is not set',
    ];
    return (
      <Popover.Content align="start" className="p-1">
        <Command>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2"
          >
            <IconArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Command.Separator />
          <Command.List>
            <div className="text-sm text-muted-foreground p-2">
              Filter options for: {selectedFilter}
            </div>
            <Command.Separator />
            <div className="flex flex-col gap-2 m-1">
              {filterOptions.map((filterOption) => (
                <div key={filterOption}>
                  <input
                    type="radio"
                    id={filterOption}
                    name="filter"
                    value={filterOption}
                    onChange={() => setOption(filterOption)}
                  />
                  <label className="ml-2">{filterOption}</label>
                  {option === filterOption &&
                    option !== 'Is set' &&
                    option !== 'Is not set' && (
                      <div className="ml-6 mt-2">
                        <Input
                          type="text"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                        />
                      </div>
                    )}
                </div>
              ))}
            </div>
          </Command.List>
          <Button
            className="mt-2"
            onClick={() => FilterButton(selectedFilter, option, value)}
          >
            Apply Filter
          </Button>
        </Command>
      </Popover.Content>
    );
  }

  return (
    <Popover.Content align="start" className="p-1">
      <Command>
        <button
          onClick={() => setView('root')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2"
        >
          <IconArrowLeft className="w-4 h-4" />
          Back
        </button>
        <Command.Separator />
        <Command.Input />
        <Command.List>
          {allFilters.map((filter) => (
            <Command.Item
              key={filter}
              value={filter}
              onSelect={() => onSelect(filter)}
              className="h-8"
            >
              {filter}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Popover.Content>
  );
}

export default AdvancedFilter;
