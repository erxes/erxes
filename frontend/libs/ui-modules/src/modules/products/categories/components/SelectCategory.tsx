import { IconCategory } from '@tabler/icons-react';
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
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDebounce } from 'use-debounce';
import { useProductCategories } from '../hooks/useCategories';
import { IProductCategory } from '../types/category';

interface SelectCategoryProviderProps {
  children: React.ReactNode;
  value?: string[] | string;
  selected?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  onSelect?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}

interface SelectCategoryContextValue {
  categoryIds: string[];
  onSelectCategory: (category: IProductCategory) => void;
  selectedCategories: IProductCategory[];
  setSelectedCategories: React.Dispatch<
    React.SetStateAction<IProductCategory[]>
  >;
  mode: 'single' | 'multiple';
}

const SelectCategoryContext = createContext<SelectCategoryContextValue | null>(
  null,
);

const useSelectCategoryContext = () => {
  const context = useContext(SelectCategoryContext);

  if (!context) {
    throw new Error(
      'useSelectCategoryContext must be used within SelectCategoryProvider',
    );
  }

  return context;
};

const SelectCategoryProvider = ({
  children,
  value,
  selected,
  onValueChange,
  onSelect,
  mode = 'single',
}: SelectCategoryProviderProps) => {
  const [selectedCategories, setSelectedCategories] = useState<
    IProductCategory[]
  >([]);
  const selectedValue = value ?? selected;
  const categoryIds = useMemo(
    () =>
      Array.isArray(selectedValue)
        ? selectedValue
        : selectedValue
        ? [selectedValue]
        : [],
    [selectedValue],
  );
  const handleValueChange = onValueChange || onSelect;
  const { productCategories } = useProductCategories({
    variables: {
      ids: categoryIds,
      status: 'active',
    },
    skip: categoryIds.length === 0,
  });

  useEffect(() => {
    if (!productCategories?.length) {
      if (categoryIds.length === 0 && selectedCategories.length > 0) {
        setSelectedCategories([]);
      }
      return;
    }

    setSelectedCategories((previousCategories) => {
      const categoryMap = new Map(
        previousCategories.map((category) => [category._id, category]),
      );

      productCategories.forEach((category) => {
        categoryMap.set(category._id, category);
      });

      return categoryIds
        .map((id) => categoryMap.get(id))
        .filter((category): category is IProductCategory => !!category);
    });
  }, [categoryIds.join(','), productCategories, selectedCategories.length]);

  const onSelectCategory = (category: IProductCategory) => {
    if (!category) return;

    if (mode === 'single') {
      setSelectedCategories([category]);
      handleValueChange?.(category._id);
      return;
    }

    const isSelected = categoryIds.includes(category._id);
    const newSelectedCategoryIds = isSelected
      ? categoryIds.filter((id) => id !== category._id)
      : [...categoryIds, category._id];

    setSelectedCategories((previousCategories) => {
      const categoryMap = new Map(
        previousCategories.map((category) => [category._id, category]),
      );
      categoryMap.set(category._id, category);

      return newSelectedCategoryIds
        .map((id) => categoryMap.get(id))
        .filter((category): category is IProductCategory => !!category);
    });
    handleValueChange?.(newSelectedCategoryIds);
  };

  return (
    <SelectCategoryContext.Provider
      value={{
        categoryIds,
        onSelectCategory,
        selectedCategories,
        setSelectedCategories,
        mode,
      }}
    >
      {children}
    </SelectCategoryContext.Provider>
  );
};

const SelectCategoryCommand = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { selectedCategories } = useSelectCategoryContext();
  const { productCategories, loading, error } = useProductCategories({
    variables: {
      searchValue: debouncedSearch,
      status: 'active',
    },
  });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search categories"
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        {selectedCategories.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 p-2">
              <SelectCategoryList />
            </div>
            <Command.Separator />
          </>
        )}
        <SelectTree.Provider id="select-product-categories" ordered={!search}>
          <Combobox.Empty loading={loading} error={error} />
          {productCategories.map((category) => (
            <SelectCategoryItem
              key={category._id}
              category={{
                ...category,
                hasChildren: productCategories.some(
                  (child) => child.parentId === category._id,
                ),
              }}
            />
          ))}
        </SelectTree.Provider>
      </Command.List>
    </Command>
  );
};

const SelectCategoryGroupsCommand = SelectCategoryCommand;

const SelectCategoryContent = () => {
  return <SelectCategoryCommand />;
};

const SelectCategoryItem = ({
  category,
}: {
  category: IProductCategory & { hasChildren?: boolean };
}) => {
  const { categoryIds, onSelectCategory } = useSelectCategoryContext();
  const isSelected = categoryIds.includes(category._id);

  return (
    <SelectTree.Item
      _id={category._id}
      name={category.name}
      order={category.order}
      hasChildren={!!category.hasChildren}
      selected={isSelected}
      disabled={isSelected}
      onSelect={() => {
        if (!isSelected) {
          onSelectCategory(category);
        }
      }}
    >
      <div className="flex overflow-hidden flex-auto gap-2 items-center">
        {category.code && (
          <span className="text-muted-foreground">{category.code}</span>
        )}
        <TextOverflowTooltip
          value={category.name}
          className="flex-auto w-auto font-medium"
        />
      </div>
    </SelectTree.Item>
  );
};

const SelectCategoryList = ({
  placeholder,
  renderAsPlainText,
}: {
  placeholder?: string;
  renderAsPlainText?: boolean;
}) => {
  const { categoryIds, selectedCategories, onSelectCategory } =
    useSelectCategoryContext();

  if (categoryIds.length === 0) {
    return <Combobox.Value placeholder={placeholder || 'Select category'} />;
  }

  const categoryMap = new Map(
    selectedCategories.map((category) => [category._id, category]),
  );

  if (renderAsPlainText) {
    const selectedCategory = categoryMap.get(categoryIds[0]);
    return (
      <span className="truncate">
        {selectedCategory
          ? `${selectedCategory.code || ''} ${selectedCategory.name}`.trim()
          : placeholder || 'Select category'}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 w-full">
      {categoryIds.map((categoryId) => {
        const category = categoryMap.get(categoryId);

        return (
          <Button
            key={categoryId}
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 max-w-full px-2 font-normal"
            onClick={(event) => {
              event.stopPropagation();
              if (category) {
                onSelectCategory(category);
              }
            }}
          >
            <span className="truncate">
              {category
                ? `${category.code || ''} ${category.name}`.trim()
                : categoryId}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

const SelectCategoryValue = ({ placeholder }: { placeholder?: string }) => {
  const { categoryIds, selectedCategories } = useSelectCategoryContext();

  if (categoryIds.length === 0) {
    return <Combobox.Value placeholder={placeholder || 'Select category'} />;
  }

  if (categoryIds.length > 1) {
    return (
      <span className="flex gap-1 items-center -ml-1 text-muted-foreground">
        <IconCategory className="size-4 text-gray-400" /> Categories +
        {categoryIds.length}
      </span>
    );
  }

  const selectedCategory = selectedCategories.find(
    (category) => category._id === categoryIds[0],
  );

  if (!selectedCategory) {
    return <Combobox.Value placeholder={placeholder || 'Select category'} />;
  }

  return <SelectCategoryList placeholder={placeholder} renderAsPlainText />;
};

const SelectCategoryInlineCell = ({
  onValueChange,
  onSelect,
  placeholder,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectCategoryProvider>, 'children'> & {
  placeholder?: string;
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCategoryProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        onSelect?.(value);
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectCategoryValue placeholder={placeholder} />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectCategoryContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectCategoryProvider>
  );
};

const SelectCategoryFormItem = ({
  onValueChange,
  onSelect,
  className,
  placeholder,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectCategoryProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCategoryProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        onSelect?.(value);
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectCategoryValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectCategoryContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectCategoryProvider>
  );
};

SelectCategoryFormItem.displayName = 'SelectCategoryFormItem';

const SelectCategoryDetail = ({
  onValueChange,
  onSelect,
  className,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectCategoryProvider>, 'children'> & {
  className?: string;
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCategoryProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        onSelect?.(value);
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
      }}
      {...props}
    >
      <div className="flex gap-2 items-center">
        <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
          <Popover.Trigger asChild>
            <Button
              className={cn('w-min text-sm font-medium shadow-xs', className)}
              variant="outline"
            >
              Add category
              <IconCategory className="text-lg" />
            </Button>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectCategoryContent />
          </Combobox.Content>
        </PopoverScoped>
        <SelectCategoryList />
      </div>
    </SelectCategoryProvider>
  );
};

const SelectCategoryConversationDetail = SelectCategoryDetail;

const SelectCategoryCommandbarItem = ({
  onValueChange,
  onSelect,
  ...props
}: Omit<React.ComponentProps<typeof SelectCategoryProvider>, 'children'>) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCategoryProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        onSelect?.(value);
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Button variant="secondary" asChild>
          <RecordTableInlineCell.Trigger>
            <IconCategory />
            Category
          </RecordTableInlineCell.Trigger>
        </Button>
        <RecordTableInlineCell.Content className="w-96">
          <SelectCategoryContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectCategoryProvider>
  );
};

const SelectCategoryFilterItem = ({
  value = 'category',
  label = 'Categories',
}: {
  value?: string;
  label?: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconCategory />
      {label}
    </Filter.Item>
  );
};

const SelectCategoryFilterView = ({
  onValueChange,
  queryKey,
  filterKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  filterKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const key = filterKey || queryKey || 'category';
  const [categories, setCategories] = useQueryState<
    string[] | string | undefined
  >(key);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={key}>
      <SelectCategoryProvider
        mode={mode}
        value={categories || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setCategories(value);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectCategoryContent />
      </SelectCategoryProvider>
    </Filter.View>
  );
};

const SelectCategoryFilterBar = ({
  onValueChange,
  queryKey,
  filterKey,
  label = 'Categories',
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  filterKey?: string;
  label?: string;
  mode?: 'single' | 'multiple';
}) => {
  const key = filterKey || queryKey || 'category';
  const [categories, setCategories] = useQueryState<
    string[] | string | undefined
  >(key);
  const [open, setOpen] = useState(false);

  if (!categories) {
    return null;
  }

  const handleValueChange = (value: string[] | string) => {
    onValueChange?.(value);

    if (value && value.length > 0) {
      setCategories(value);
    } else {
      setCategories(null);
    }

    if (mode === 'single') {
      setOpen(false);
    }
  };

  return (
    <Filter.BarItem queryKey={key}>
      <Filter.BarName>
        <IconCategory />
        {label}
      </Filter.BarName>
      <SelectCategoryProvider
        mode={mode}
        value={categories || (mode === 'single' ? '' : [])}
        onValueChange={handleValueChange}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={key}>
              <SelectCategoryValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectCategoryContent />
          </Combobox.Content>
        </Popover>
      </SelectCategoryProvider>
    </Filter.BarItem>
  );
};

const SelectCategoryRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectCategoryProvider>, 'children'> &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children'
    > & {
      placeholder?: string;
      scope?: string;
    }
>(
  (
    {
      onValueChange,
      onSelect,
      className,
      mode = 'single',
      value,
      selected,
      placeholder,
      scope,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    return (
      <SelectCategoryProvider
        mode={mode}
        value={value}
        selected={selected}
        onValueChange={(value) => {
          if (mode === 'single') {
            setOpen(false);
          }
          onValueChange?.(value);
          onSelect?.(value);
        }}
      >
        <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
          <Combobox.Trigger
            className={cn('inline-flex w-full', className)}
            variant="outline"
            ref={ref}
            {...props}
          >
            <SelectCategoryValue placeholder={placeholder} />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectCategoryContent />
          </Combobox.Content>
        </PopoverScoped>
      </SelectCategoryProvider>
    );
  },
);

SelectCategoryRoot.displayName = 'SelectCategoryRoot';

export const SelectCategory = Object.assign(SelectCategoryRoot, {
  Provider: SelectCategoryProvider,
  CommandbarItem: SelectCategoryCommandbarItem,
  Content: SelectCategoryContent,
  Command: SelectCategoryCommand,
  GroupsCommand: SelectCategoryGroupsCommand,
  Item: SelectCategoryItem,
  Value: SelectCategoryValue,
  List: SelectCategoryList,
  InlineCell: SelectCategoryInlineCell,
  Detail: SelectCategoryDetail,
  ConversationDetail: SelectCategoryConversationDetail,
  FormItem: SelectCategoryFormItem,
  FilterItem: SelectCategoryFilterItem,
  FilterView: SelectCategoryFilterView,
  FilterBar: SelectCategoryFilterBar,
});
