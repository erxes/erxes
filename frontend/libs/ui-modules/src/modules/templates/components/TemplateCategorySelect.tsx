import { IconCategory, IconPlus } from '@tabler/icons-react';
import {
  AvatarProps,
  Button,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';
import {
  SelectCategoryContext,
  useSelectCategoryContext,
} from 'ui-modules/modules/templates/context/TemplateCategorySelectContext';
import { useDebounce } from 'use-debounce';
import { useTemplateCategories } from '../hooks/useTemplateCategories';
import { TemplateCategory } from '../types';
import { TemplateCategoriesInline } from './TemplateCategoryInline';

const SelectCategoryProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  categories,
  setOpen,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange?: (value: string[] | string | null) => void;
  categories?: TemplateCategory[];
  setOpen?: (open: boolean) => void;
}) => {
  const [_categories, _setCategories] = useState<TemplateCategory[]>(
    categories || [],
  );
  const isSingleMode = mode === 'single';

  const onSelect = (category: TemplateCategory | null) => {
    if (!category) {
      _setCategories([]);
      onValueChange?.(mode === 'single' ? null : []);
      setOpen?.(false);
      return;
    }
    if (isSingleMode) {
      _setCategories([category]);
      setOpen?.(false);
      return onValueChange?.(category._id);
    }
    const arrayValue = Array.isArray(value) ? value : [];

    const isCategorySelected = arrayValue.includes(category._id);
    const newSelectedCategoryIds = isCategorySelected
      ? arrayValue.filter((id) => id !== category._id)
      : [...arrayValue, category._id];

    _setCategories((prev) => {
      const uniqueCategories = [...prev, category].filter(
        (m, index, self) => index === self.findIndex((t) => t._id === m._id),
      );
      return uniqueCategories.filter((m) =>
        newSelectedCategoryIds.includes(m._id),
      );
    });
    onValueChange?.(newSelectedCategoryIds);
  };

  const categoryIds = !value ? [] : Array.isArray(value) ? value : [value];

  const loading = categoryIds.some(
    (id) => !_categories.some((m) => m._id === id),
  );

  return (
    <SelectCategoryContext.Provider
      value={{
        categoryIds,
        onSelect,
        categories: _categories,
        setCategories: _setCategories,
        loading,
      }}
    >
      {children}
    </SelectCategoryContext.Provider>
  );
};

const SelectCategoryValue = ({ placeholder }: { placeholder?: string }) => {
  const { categoryIds, categories, setCategories } = useSelectCategoryContext();

  return (
    <TemplateCategoriesInline
      categoryIds={categoryIds}
      categories={categories}
      updateCategories={setCategories}
      placeholder={placeholder}
    />
  );
};

const SelectCategoryCommandItem = ({
  category,
}: {
  category: TemplateCategory;
}) => {
  const { onSelect, categoryIds } = useSelectCategoryContext();

  return (
    <Command.Item
      value={category._id}
      onSelect={() => {
        onSelect(category);
      }}
    >
      <TemplateCategoriesInline
        categories={[
          {
            ...category,
          },
        ]}
        placeholder="Unnamed category"
      />
      <Combobox.Check checked={categoryIds.includes(category._id)} />
    </Command.Item>
  );
};

const SelectCategoryNoAssigneeItem = () => {
  const { onSelect, categoryIds } = useSelectCategoryContext();

  const isNoAssigneeSelected =
    categoryIds?.length === 1 && categoryIds[0] === 'no-assignee';
  return (
    <Command.Item value="no-assignee" onSelect={() => onSelect(null)}>
      <TemplateCategoriesInline
        categoryIds={[]}
        placeholder="Unnamed category"
      />
      <Combobox.Check checked={isNoAssigneeSelected} />
    </Command.Item>
  );
};

const SelectCategoryContent = () => {
  const [search, setSearch] = useState('');

  const [debouncedSearch] = useDebounce(search, 500);

  const { categoryIds, categories } = useSelectCategoryContext();

  const {
    categories: templateCategories,
    loading,
    handleFetchMore,
    error,
    totalCount,
  } = useTemplateCategories({
    variables: {
      searchValue: debouncedSearch,
    },
  });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        <Combobox.Empty loading={loading} error={error} />
        {categories.length > 0 && (
          <>
            {categories.map((category) => (
              <SelectCategoryCommandItem
                key={category._id}
                category={category}
              />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}

        {!loading &&
          (templateCategories || [])
            .filter(
              (category) =>
                !categoryIds.some(
                  (categoryIds) => categoryIds === category._id,
                ),
            )
            .map((category) => (
              <SelectCategoryCommandItem
                key={category._id}
                category={category}
              />
            ))}

        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={templateCategories?.length || 0}
          totalCount={totalCount || 0}
        />
      </Command.List>
    </Command>
  );
};

export const SelectCategoryFilterItem = ({
  value,
  label,
}: {
  value?: string;
  label?: string;
}) => {
  return (
    <Filter.Item value={value || 'categoryId'}>
      <IconCategory />
      {label || 'Category'}
    </Filter.Item>
  );
};

export const SelectCategoryFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string | null) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [categoryId, setAssignedTo] = useQueryState<string[] | string>(
    queryKey || 'categoryId',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'categoryId'}>
      <SelectCategoryProvider
        mode={mode}
        value={categoryId || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setAssignedTo(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectCategoryContent />
      </SelectCategoryProvider>
    </Filter.View>
  );
};

export const SelectCategoryFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  mode = 'single',
  label,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string | null) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  label?: string;
}) => {
  const [categoryId, setAssignedTo] = useQueryState<string[] | string>(
    queryKey || 'categoryId',
  );
  const [open, setOpen] = useState(false);

  if (!categoryId) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={queryKey || 'categoryId'}>
      <Filter.BarName>
        <IconCategory />
        {label || (!iconOnly && 'Assigned To')}
      </Filter.BarName>
      <SelectCategoryProvider
        mode={mode}
        value={categoryId || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value && value.length > 0) {
            setAssignedTo(value);
          } else {
            setAssignedTo(null);
          }
          onValueChange?.(value);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'categoryId'}>
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

export const SelectCategoryInlineCell = React.forwardRef<
  React.ComponentRef<typeof RecordTableInlineCell.Trigger>,
  Omit<React.ComponentProps<typeof SelectCategoryProvider>, 'children'> &
    React.ComponentProps<typeof RecordTableInlineCell.Trigger> & {
      scope?: string;
      placeholder?: string;
      size?: AvatarProps['size'];
    }
>(
  (
    {
      mode,
      value,
      onValueChange,
      categories,
      scope,
      placeholder,
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    return (
      <SelectCategoryProvider
        mode={mode}
        value={value}
        onValueChange={onValueChange}
        categories={categories}
        setOpen={setOpen}
      >
        <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
          <RecordTableInlineCell.Trigger
            ref={ref}
            {...props}
            className={cn(className, 'text-xs')}
          >
            <SelectCategoryValue placeholder={placeholder ?? ''} />
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <SelectCategoryContent />
          </RecordTableInlineCell.Content>
        </PopoverScoped>
      </SelectCategoryProvider>
    );
  },
);

SelectCategoryInlineCell.displayName = 'SelectCategoryInlineCell';

export const SelectCategoryFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectCategoryProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectCategoryProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        props.mode !== 'multiple' && setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('shadow-xs w-full', className)}>
            <SelectCategoryValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectCategoryContent />
        </Combobox.Content>
      </Popover>
    </SelectCategoryProvider>
  );
};

export const SelectCategoryDetail = ({
  onValueChange,
  className,
  placeholder,
  value,
  ...props
}: Omit<React.ComponentProps<typeof SelectCategoryProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectCategoryProvider
      value={value}
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          {value === null || value === undefined ? (
            <Combobox.TriggerBase className="font-medium">
              Add Owner <IconPlus />
            </Combobox.TriggerBase>
          ) : (
            <Button variant="ghost" className="inline-flex w-full">
              <SelectCategoryValue />
            </Button>
          )}
        </Popover.Trigger>
        <Combobox.Content>
          <SelectCategoryContent />
        </Combobox.Content>
      </Popover>
    </SelectCategoryProvider>
  );
};

export const SelectCategoryRoot = ({
  onValueChange,
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
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger
          className={cn('inline-flex w-full', className)}
          variant="outline"
        >
          <SelectCategoryValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectCategoryContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectCategoryProvider>
  );
};

export const SelectCategoryCustomDetail = ({
  onValueChange,
  className,
  value,
  ...props
}: Omit<React.ComponentProps<typeof SelectCategoryProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectCategoryProvider
      value={value}
      onValueChange={(value) => {
        onValueChange?.(value);
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.TriggerBase asChild>
          <Button
            variant="ghost"
            className={cn('inline-flex w-auto h-7', className)}
          >
            <SelectCategoryValue />
          </Button>
        </Combobox.TriggerBase>
        <Combobox.Content>
          <SelectCategoryContent />
        </Combobox.Content>
      </Popover>
    </SelectCategoryProvider>
  );
};

export const SelectTemplateCategory = Object.assign(SelectCategoryRoot, {
  Provider: SelectCategoryProvider,
  Value: SelectCategoryValue,
  Content: SelectCategoryContent,
  CommandItem: SelectCategoryCommandItem,
  NoAssigneeItem: SelectCategoryNoAssigneeItem,
  FilterItem: SelectCategoryFilterItem,
  FilterView: SelectCategoryFilterView,
  FilterBar: SelectCategoryFilterBar,
  InlineCell: SelectCategoryInlineCell,
  FormItem: SelectCategoryFormItem,
  Detail: SelectCategoryDetail,
  CustomDetail: SelectCategoryCustomDetail,
});
