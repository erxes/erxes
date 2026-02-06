import {
  Button,
  Popover,
  Command,
  useFilterContext,
  Input,
  useQueryState,
  Filter,
} from 'erxes-ui';
import { IconArrowLeft, IconCirclePlus, IconX } from '@tabler/icons-react';
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

interface FilterEntry {
  filter: string;
  option: string;
  value: string;
}


export const AdvancedFilter = () => {
  const { resetFilterState } = useFilterContext();
  const { setView } = useFilterContext();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [option, setOption] = useState<string | null>(null);
  const [value, setValue] = useState<string>('');
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [filterData, setFilterData] = useState<FilterEntry | null>(null);  
  // const [boardId, setBoardId] = useQueryState('boardId');
  // const [pipelineId, setPipelineId] = useQueryState('pipelineId');
  const [advancedFilters, setAdvancedFilters] = useQueryState<Record<
    string,
    string
  > | null>('advanced')

  const onSelect = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleBack = () => {
    setSelectedFilter(null);
  };

  const handleApplyFilter = (filter: string, option: any, value: string) => {
    setFilterData({ filter, option, value });
    setIsApplied(true);
  };

  const removeAdvancedFilter = (filterKey: string) => {
    const currentFilters = advancedFilters || {};
    const newFilters = { ...currentFilters };
    delete newFilters[filterKey];

    if (Object.keys(newFilters).length === 0) {
      setAdvancedFilters(null);
    } else {
      setAdvancedFilters(newFilters);
    }
    resetFilterState();
  };

  const clearAllAdvancedFilters = () => {
    setAdvancedFilters(null);
    resetFilterState();
  };

  const finalFilter = () => {
    if (filterData) {
      const currentFilters = advancedFilters || {};
      const filterKey = `${filterData.filter}_${filterData.option}`;
      setAdvancedFilters({
        ...currentFilters,
        [filterKey]: filterData.value,
      });
    }
    setIsApplied(false);
    setSelectedFilter(null);
    setOption(null);
    setValue('');
    setFilterData(null);
    resetFilterState();
  };

  if (
    advancedFilters &&
    Object.keys(advancedFilters).length > 0 &&
    !selectedFilter &&
    !isApplied
  ) {
    return (
      <Popover.Content align="start" className="p-1">
        <Command>
          <button
            onClick={() => {
              setSelectedFilter(null);
              setOption(null);
              setValue('');
              setFilterData(null);
              setIsApplied(false);
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2"
          >
            <IconArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Command.Separator />
          <Command.List className="p-2">
            <div className="space-y-2">
              {Object.entries(advancedFilters).map(([key, value]) => {
                const [filter, option] = key.split('_');
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">
                      <strong>{filter}</strong> {option}{' '}
                      <strong>{value}</strong>
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAdvancedFilter(key)}
                      className="h-6 w-6 p-0"
                    >
                      <IconX className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </Command.List>
          <div className="flex gap-2 p-2 border-t">
            <Button
              size="sm"
              variant="secondary"
              onClick={clearAllAdvancedFilters}
              className="text-xs"
            >
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={() => setSelectedFilter('')}
              className="text-xs"
            >
              Add Filter
            </Button>
          </div>
        </Command>
      </Popover.Content>
    );
  }

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
          <Button className="text-sm" onClick={() => finalFilter()}>
            Filter
          </Button>
          <Button
            className="text-sm"
            variant="secondary"
            onClick={() => setIsApplied(false)}
          >
            Cancel
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
            <div className="text-sm p-2">{selectedFilter}</div>
            <Command.Separator />
            <div className="flex flex-col gap-2 mx-1 my-2">
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
            onClick={() => handleApplyFilter(selectedFilter, option, value)}
            disabled={
              !option ||
              (option !== 'Is set' && option !== 'Is not set' && !value.trim())
            }
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
          onClick={() => {
           setView('root');
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2"
        >
          <IconArrowLeft className="w-4 h-4" />
          Back
        </button>
        <Command.Separator />
        <Command.Input placeholder="Search filters..." />
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
};

export const AdvancedFilterBar = () => {
  const [advancedFilters] = useQueryState<Record<string, any> | null>(
    'advanced',
  );

  if (!advancedFilters || Object.keys(advancedFilters).length === 0) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="advanced">
      <Filter.BarName>Advanced Filters</Filter.BarName>
      <div className="flex flex-wrap gap-1">
        {Object.entries(advancedFilters).map(([key, value]) => {
          const [filter, option] = key.split('_');
          return (
            <div
              key={key}
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm"
            >
              <span>
                {filter} {option} {value}
              </span>
            </div>
          );
        })}
      </div>
    </Filter.BarItem>
  );
};
