import React, { createContext, useContext, useState } from 'react';
import { useCategories } from '../hooks/useTemplates';
import {
  Command,
  Filter,
  Checkbox,
  Popover,
  Button,
  useQueryState,
  useFilterContext,
  ScrollArea,
} from 'erxes-ui';
import { IconFolder, IconCheck } from '@tabler/icons-react';
import { ITemplateCategory } from '../types/types';

interface SelectTemplateCategoryContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  categories: ITemplateCategory[];
  loading: boolean;
}

const SelectTemplateCategoryContext = createContext<
  SelectTemplateCategoryContextValue | undefined
>(undefined);

const useSelectTemplateCategoryContext = () => {
  const context = useContext(SelectTemplateCategoryContext);
  if (!context) {
    throw new Error(
      'useSelectTemplateCategoryContext must be used within SelectTemplateCategoryProvider',
    );
  }
  return context;
};

interface SelectTemplateCategoryProviderProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  children: React.ReactNode;
}

const SelectTemplateCategoryProvider: React.FC<
  SelectTemplateCategoryProviderProps
> = ({ value, onValueChange, children }) => {
  const { categories, loading } = useCategories();

  return (
    <SelectTemplateCategoryContext.Provider
      value={{ value, onValueChange, categories, loading }}
    >
      {children}
    </SelectTemplateCategoryContext.Provider>
  );
};

const SelectTemplateCategoryContent: React.FC = () => {
  const { value, onValueChange, categories, loading } =
    useSelectTemplateCategoryContext();

  const handleToggle = (categoryId: string) => {
    const newValue = value.includes(categoryId)
      ? value.filter((id) => id !== categoryId)
      : [...value, categoryId];
    onValueChange(newValue);
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading categories...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No categories available
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <Command.List>
        {categories.map((category) => (
          <Command.Item
            key={category._id}
            onSelect={() => handleToggle(category._id)}
            className="flex items-center gap-2"
          >
            <Checkbox checked={value.includes(category._id)} />
            <IconFolder size={16} />
            <span className="flex-1">{category.name}</span>
            {category.code && (
              <span className="text-xs text-muted-foreground">
                {category.code}
              </span>
            )}
            {value.includes(category._id) && (
              <IconCheck size={16} className="ml-auto" />
            )}
          </Command.Item>
        ))}
      </Command.List>
    </ScrollArea>
  );
};

// Filter Item - appears in filter menu
export const SelectTemplateCategoryFilterItem: React.FC = () => {
  return (
    <Filter.Item value="categoryIds">
      <IconFolder />
      Category
    </Filter.Item>
  );
};

// Filter View - rendered when filter item is selected
export const SelectTemplateCategoryFilterView: React.FC = () => {
  const [query, setQuery] = useQueryState<string[]>('categoryIds');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="categoryIds">
      <SelectTemplateCategoryProvider
        value={query || []}
        onValueChange={(value) => {
          setQuery(value.length > 0 ? value : null);
          resetFilterState();
        }}
      >
        <Command>
          <Filter.CommandInput
            placeholder="Search categories..."
            variant="secondary"
          />
          <SelectTemplateCategoryContent />
        </Command>
      </SelectTemplateCategoryProvider>
    </Filter.View>
  );
};

// Filter Bar - displays active filter at top
interface SelectTemplateCategoryFilterBarProps {
  queryKey?: string;
}

export const SelectTemplateCategoryFilterBar: React.FC<
  SelectTemplateCategoryFilterBarProps
> = ({ queryKey = 'categoryIds' }) => {
  const [query, setQuery] = useQueryState<string[]>(queryKey);
  const [open, setOpen] = useState(false);
  const { categories } = useCategories();

  if (!query || query.length === 0) return null;

  const selectedCategories = categories.filter((c) => query.includes(c._id));

  const displayText =
    selectedCategories.length > 0
      ? selectedCategories.map((c) => c.name).join(', ')
      : `${query.length} selected`;

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <IconFolder />
        Category
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button variant="ghost" size="sm" className="h-auto py-1 px-2">
            <span className="truncate max-w-[200px]">{displayText}</span>
          </Button>
        </Popover.Trigger>
        <Popover.Content className="p-0 w-[300px]">
          <SelectTemplateCategoryProvider
            value={query || []}
            onValueChange={(value) => {
              if (value && value.length > 0) {
                setQuery(value);
              } else {
                setQuery(null);
              }
              setOpen(false);
            }}
          >
            <Command>
              <Filter.CommandInput placeholder="Search categories..." />
              <SelectTemplateCategoryContent />
            </Command>
          </SelectTemplateCategoryProvider>
        </Popover.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const SelectTemplateCategory = Object.assign(
  {},
  {
    Provider: SelectTemplateCategoryProvider,
    Content: SelectTemplateCategoryContent,
    FilterItem: SelectTemplateCategoryFilterItem,
    FilterView: SelectTemplateCategoryFilterView,
    FilterBar: SelectTemplateCategoryFilterBar,
  },
);
