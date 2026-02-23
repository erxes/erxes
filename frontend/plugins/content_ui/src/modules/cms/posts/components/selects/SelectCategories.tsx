import { IconGitBranch, IconPlus } from '@tabler/icons-react';
import {
  Button,
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  SelectTree,
  TextOverflowTooltip,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { SelectCategoriesContext } from './context/SelectCategoriesContext';
import { useSelectCategoriesContext } from './context/useSelectCategoriesContext';
import { ICategory, ISelectCategoriesProviderProps } from './types/category';
import {
  CreateCategoryForm,
  SelectCategoryCreateContainer,
} from './CreateForm';
import { useCategories } from './hooks/useCategories';

export const SelectCategoriesProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
}: ISelectCategoriesProviderProps) => {
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([]);
  const categoryIds = !value ? [] : Array.isArray(value) ? value : [value];

  const handleSelectCallback = (category: ICategory) => {
    if (!category) return;

    const isSingleMode = mode === 'single';
    const multipleValue = (value as string[]) || [];
    const isSelected = !isSingleMode && multipleValue.includes(category._id);

    const newSelectedCategoryIds = isSingleMode
      ? [category._id]
      : isSelected
      ? multipleValue.filter((p) => p !== category._id)
      : [...multipleValue, category._id];

    const newSelectedCategories = isSingleMode
      ? [category]
      : isSelected
      ? selectedCategories.filter((p) => p._id !== category._id)
      : [...selectedCategories, category];

    setSelectedCategories(newSelectedCategories);
    onValueChange?.(isSingleMode ? category._id : newSelectedCategories);
  };

  return (
    <SelectCategoriesContext.Provider
      value={{
        onSelect: handleSelectCallback,
        value,
        selectedCategories,
        setSelectedCategories,
        newCategoryName,
        setNewCategoryName,
        mode,
        categoryIds,
      }}
    >
      {children}
    </SelectCategoriesContext.Provider>
  );
};

export const SelectCategoriesCommand = ({
  disableCreateOption,
}: {
  disableCreateOption?: boolean;
}) => {
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { selectedCategories, categoryIds } = useSelectCategoriesContext();
  const [noBranchesSearchValue, setNoBranchesSearchValue] =
    useState<string>('');

  const {
    sortedCategories: categories,
    loading,
    error,
    handleFetchMore,
    totalCount,
  } = useCategories({
    variables: {
      searchValue: debouncedSearch,
    },
    skip:
      !!noBranchesSearchValue &&
      debouncedSearch.includes(noBranchesSearchValue),
    onCompleted(data) {
      const { totalCount } = data?.categoriesMain || {};
      setNoBranchesSearchValue(totalCount === 0 ? debouncedSearch : '');
    },
  });
  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search categories"
        focusOnMount
      />
      <Command.List>
        {selectedCategories?.length > 0 && (
          <>
            <div className="flex flex-wrap justify-start p-2 gap-2">
              <CategoriesList />
            </div>
            <Command.Separator />
          </>
        )}
        <SelectTree.Provider id={'select-branches'} ordered={!search}>
          <SelectCategoryCreate
            search={search}
            show={!disableCreateOption && !loading && !categories?.length}
          />
          <Combobox.Empty loading={loading} error={error} />
          {categories
            ?.filter((b) => !categoryIds?.find((bId) => bId === b._id))
            .map((category) => (
              <SelectCategoriesItem
                key={category._id}
                category={{
                  ...category,
                  hasChildren: categories.some(
                    (b) => b.parentId === category._id,
                  ),
                }}
              />
            ))}
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={categories?.length || 0}
            totalCount={totalCount}
          />
        </SelectTree.Provider>
      </Command.List>
    </Command>
  );
};

export const SelectCategoriesCreate = ({
  search,
  show,
}: {
  search: string;
  show: boolean;
}) => {
  const { setNewCategoryName } = useSelectCategoriesContext();

  if (!search || !show) return null;

  return (
    <Command.Item
      onSelect={() => setNewCategoryName(search)}
      className="font-medium"
    >
      <IconPlus />
      Create new category: "{search}"
    </Command.Item>
  );
};

export const SelectCategoriesItem = ({
  category,
}: {
  category: ICategory & { hasChildren: boolean };
}) => {
  const { onSelect, categoryIds } = useSelectCategoriesContext();
  const isSelected = categoryIds?.some((b) => b === category._id);
  return (
    <SelectTree.Item
      key={category._id}
      _id={category._id}
      name={category.title}
      order={category.order}
      hasChildren={category.hasChildren}
      selected={isSelected}
      onSelect={() => onSelect(category)}
    >
      <TextOverflowTooltip
        value={category.title}
        className="flex-auto w-auto font-medium"
      />
    </SelectTree.Item>
  );
};

export const CategoriesList = ({
  placeholder,
  renderAsPlainText,
  ...props
}: {
  placeholder?: string;
  renderAsPlainText?: boolean;
}) => {
  const { value } = useSelectCategoriesContext();

  if (!value || !value.length) {
    return <Combobox.Value placeholder={placeholder || ''} />;
  }

  return <></>;
};

export const SelectCategoriesValue = () => {
  const { selectedCategories, mode } = useSelectCategoriesContext();

  if (selectedCategories?.length > 1)
    return (
      <span className="text-muted-foreground">
        {selectedCategories.length} categories selected
      </span>
    );

  return (
    <CategoriesList
      placeholder="Select categories"
      renderAsPlainText={mode === 'single'}
    />
  );
};

export const SelectCategoriesContent = () => {
  const { newCategoryName } = useSelectCategoriesContext();

  if (newCategoryName) {
    return (
      <SelectCategoriesCreateContainer>
        <CreateCategoryForm />
      </SelectCategoriesCreateContainer>
    );
  }
  return <SelectCategoriesCommand />;
};

export const SelectCategoriesInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectCategoriesProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectCategoriesProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectCategoriesValue />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="min-w-72">
          <SelectCategoriesContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectCategoriesProvider>
  );
};

const SelectCategoriesBadgesView = () => {
  const { categoryIds, selectedCategories, setSelectedCategories, onSelect } =
    useSelectCategoriesContext();

  return (
    <div className="flex gap-2 flex-wrap">
      {categoryIds?.map((cId) => (
        <CategoryBadge
          key={cId}
          categoryId={cId}
          onCompleted={(category) => {
            if (!category) return;
            if (categoryIds.includes(category._id)) {
              setSelectedCategories([...selectedCategories, category]);
            }
          }}
          onClose={() =>
            onSelect?.(
              selectedCategories.find((p) => p._id === cId) as ICategory,
            )
          }
        />
      ))}
    </div>
  );
};

export const SelectCategoriesDetail = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectCategoriesProvider>, 'children'> &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children'
    > & {
      scope?: string;
    }
>(
  (
    { onValueChange, scope, value, mode, options, className, ...props },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    return (
      <SelectCategoriesProvider
        onValueChange={(value) => {
          if (mode === 'single') {
            setOpen(false);
          }
          onValueChange?.(value);
        }}
        value={value}
        {...props}
        mode={mode}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button
              className={cn(
                'w-min inline-flex text-sm font-medium shadow-xs',
                className,
              )}
              variant="outline"
            >
              Add Categories
              <IconPlus className="text-lg" />
            </Button>
          </Popover.Trigger>
          <Combobox.Content className="mt-2">
            <SelectCategoriesContent />
          </Combobox.Content>
        </Popover>
        <SelectCategoriesBadgesView />
      </SelectCategoriesProvider>
    );
  },
);

SelectCategoriesDetail.displayName = 'SelectCategoriesDetail';

export const SelectCategoriesCommandbarItem = ({
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof SelectCategoriesProvider>, 'children'>) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCategoriesProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Button variant={'secondary'} asChild>
          <RecordTableInlineCell.Trigger>
            <IconGitBranch />
            Branch
          </RecordTableInlineCell.Trigger>
        </Button>
        <RecordTableInlineCell.Content className="w-96">
          <SelectCategoriesContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectCategoriesProvider>
  );
};

export const SelectCategoriesFormItem = ({
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectCategoriesProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <SelectCategoriesProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectCategoriesValue />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectCategoriesContent />
        </Combobox.Content>
      </Popover>
    </SelectCategoriesProvider>
  );
};

export const SelectCategoriesFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconGitBranch />
      {label}
    </Filter.Item>
  );
};

export const SelectCategoriesFilterView = ({
  mode,
  filterKey,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
}) => {
  const [query, setQuery] = useQueryState<string[] | string | undefined>(
    filterKey,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={filterKey}>
      <SelectCategoriesProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          setQuery(value);
          resetFilterState();
        }}
      >
        <SelectCategoriesContent />
      </SelectCategoriesProvider>
    </Filter.View>
  );
};

export const SelectCategoriesFilterBar = ({
  mode = 'multiple',
  filterKey,
  label,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
  label: string;
}) => {
  const [query, setQuery] = useQueryState<string[]>(filterKey);
  const [open, setOpen] = useState<boolean>(false);

  if (!query) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={filterKey}>
      <Filter.BarName>
        <IconGitBranch />
        {label}
      </Filter.BarName>
      <SelectCategoriesProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          if (value && value.length > 0) {
            setQuery(value as string[]);
          } else {
            setQuery(null);
          }
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={filterKey}>
              <SelectCategoriesValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectCategoriesContent />
          </Combobox.Content>
        </Popover>
      </SelectCategoriesProvider>
    </Filter.BarItem>
  );
};

export const SelectCategories = Object.assign(SelectCategoriesProvider, {
  CommandBarItem: SelectCategoriesCommandbarItem,
  Content: SelectCategoriesContent,
  Command: SelectCategoriesCommand,
  Item: SelectCategoriesItem,
  Value: SelectCategoriesValue,
  List: CategoriesList,
  InlineCell: SelectCategoriesInlineCell,
  FormItem: SelectCategoriesFormItem,
  FilterItem: SelectCategoriesFilterItem,
  FilterView: SelectCategoriesFilterView,
  FilterBar: SelectCategoriesFilterBar,
  Detail: SelectCategoriesDetail,
});
