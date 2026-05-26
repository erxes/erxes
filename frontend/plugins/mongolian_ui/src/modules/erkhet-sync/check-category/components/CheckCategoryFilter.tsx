import { IconChevronDown } from '@tabler/icons-react';
import { Button, DropdownMenu, cn } from 'erxes-ui';
import { useCheckCategory } from '../hooks/useCheckCategory';
import { CategoryStatus } from '../types/categoryItem';

type FilterableStatus = 'create' | 'update' | 'delete';

const FILTERS: Array<{
  value: FilterableStatus;
  label: string;
  dot: string;
  badge: string;
}> = [
  { value: 'create', label: 'Create', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  { value: 'update', label: 'Update', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  { value: 'delete', label: 'Delete', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
];

const DEFAULT_FILTER = FILTERS[0];

export const CheckCategoryFilter = () => {
  const { selectedFilter, setSelectedFilter, toCheckCategoriesData } =
    useCheckCategory();

  const getCount = (type: FilterableStatus) =>
    toCheckCategoriesData?.[type]?.items?.length ?? 0;

  const selected = FILTERS.find((f) => f.value === selectedFilter) ?? DEFAULT_FILTER;;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 pr-2">
          <span className={cn('size-2 rounded-full shrink-0', selected.dot)} />
          {selected.label}
          <span className={cn('ml-0.5 rounded px-1.5 py-0.5 text-xs font-medium tabular-nums', selected.badge)}>
            {getCount(selectedFilter)}
          </span>
          <IconChevronDown size={13} className="ml-1 text-muted-foreground" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="w-44 p-1">
        {FILTERS.map((filter) => {
          const count = getCount(filter.value);
          const isActive = selectedFilter === filter.value;
          return (
            <DropdownMenu.Item
              key={filter.value}
              className={cn(
                'flex items-center gap-2.5 rounded-sm px-2 py-1.5 cursor-pointer',
                isActive && 'bg-accent',
              )}
              onSelect={() => setSelectedFilter(filter.value as CategoryStatus)}
            >
              <span className={cn('size-2 rounded-full shrink-0', filter.dot)} />
              <span className="flex-1 text-sm">{filter.label}</span>
              <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium tabular-nums', filter.badge)}>
                {count}
              </span>
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
