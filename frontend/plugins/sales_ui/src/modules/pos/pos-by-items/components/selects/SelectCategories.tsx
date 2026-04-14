import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  Form,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';

import { IconCategory } from '@tabler/icons-react';
import { PRODUCT_CATEGORIES_QUERY } from '../../graphql/queries/productCategoriesQuery';
import { useQuery } from '@apollo/client';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';

interface ICategory {
  _id: string;
  name: string;
  slug?: string;
  colorCode?: string;
  clientPortalId?: string;
}

interface SelectCategoriesContextType {
  value: string;
  onValueChange: (category: string) => void;
  categories?: ICategory[];
  loading?: boolean;
}

const SelectCategoriesContext =
  createContext<SelectCategoriesContextType | null>(null);

const useSelectCategoriesContext = () => {
  const context = useContext(SelectCategoriesContext);
  if (!context) {
    throw new Error(
      'useSelectCategoriesContext must be used within SelectCategoriesProvider',
    );
  }
  return context;
};

export const SelectCategoriesProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
  clientPortalId,
}: {
  value: string | string[];
  onValueChange: (category: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  clientPortalId?: string;
}) => {
  const { data, loading } = useQuery(PRODUCT_CATEGORIES_QUERY, {
    variables: {
      status: 'active',
    },
  });

  const categories = useMemo(
    () => data?.productCategories || [],
    [data?.productCategories],
  );

  const handleValueChange = useCallback(
    (category: string) => {
      if (!category) return;
      onValueChange?.(category);
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      value:
        mode === 'single'
          ? (value as string) || ''
          : (value as string[]).join(','),
      onValueChange: handleValueChange,
      categories,
      loading,
    }),
    [value, handleValueChange, categories, loading, mode],
  );

  return (
    <SelectCategoriesContext.Provider value={contextValue}>
      {children}
    </SelectCategoriesContext.Provider>
  );
};

const SelectCategoriesValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, categories } = useSelectCategoriesContext();
  const selectedCategory = categories?.find(
    (category) => category._id === value,
  );

  if (!selectedCategory) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select category'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {selectedCategory.colorCode && (
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: selectedCategory.colorCode }}
        />
      )}
      <p className={cn('font-medium text-sm', className)}>
        {selectedCategory.name}
      </p>
    </div>
  );
};

const SelectCategoriesCommandItem = ({ category }: { category: ICategory }) => {
  const { onValueChange, value } = useSelectCategoriesContext();
  const { _id, name, colorCode } = category || {};
  const isChecked = value.split(',').includes(_id);

  return (
    <Command.Item
      value={_id}
      onSelect={() => {
        onValueChange(_id);
      }}
    >
      <div className="flex items-center gap-2">
        {colorCode && (
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colorCode }}
          />
        )}
        <span className="font-medium">{name}</span>
      </div>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectCategoriesContent = () => {
  const { categories, loading } = useSelectCategoriesContext();

  if (loading) {
    return (
      <Command>
        <Command.Input placeholder="Search categories" />
        <Command.List>
          <div className="flex items-center justify-center py-4 h-32">
            <span className="text-muted-foreground">Loading categories...</span>
          </div>
        </Command.List>
      </Command>
    );
  }

  return (
    <Command>
      <Command.Input placeholder="Search categories" />
      <Command.Empty>
        <span className="text-muted-foreground">No categories found</span>
      </Command.Empty>
      <Command.List>
        {categories?.map((category) => (
          <SelectCategoriesCommandItem key={category._id} category={category} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectCategoriesFilterItem = () => {
  return (
    <Filter.Item value="category">
      <IconCategory />
      Categories
    </Filter.Item>
  );
};

export const SelectCategoriesFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  clientPortalId,
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  clientPortalId?: string;
}) => {
  const [categories, setCategories] = useQueryState<string[] | string>(
    queryKey || 'category',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'category'}>
      <SelectCategoriesProvider
        mode={mode}
        value={categories || (mode === 'single' ? '' : [])}
        clientPortalId={clientPortalId}
        onValueChange={(value) => {
          setCategories(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectCategoriesContent />
      </SelectCategoriesProvider>
    </Filter.View>
  );
};

export const SelectCategoriesFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
  clientPortalId,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  clientPortalId?: string;
}) => {
  const [categories, setCategories] = useQueryState<string[] | string>(
    'category',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'category'}>
      <Filter.BarName>
        <IconCategory />
        Categories
      </Filter.BarName>
      <SelectCategoriesProvider
        mode={mode}
        value={categories || (mode === 'single' ? '' : [])}
        clientPortalId={clientPortalId}
        onValueChange={(value) => {
          if (value.length > 0) {
            setCategories(value as string[] | string);
          } else {
            setCategories(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'category'}>
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

export const SelectCategoriesFormItem = ({
  onValueChange,
  className,
  placeholder,
  clientPortalId,
  ...props
}: Omit<React.ComponentProps<typeof SelectCategoriesProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  clientPortalId?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectCategoriesProvider
      clientPortalId={clientPortalId}
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectCategoriesValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectCategoriesContent />
        </Combobox.Content>
      </Popover>
    </SelectCategoriesProvider>
  );
};

SelectCategoriesFormItem.displayName = 'SelectCategoriesFormItem';

const SelectCategoriesRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
  clientPortalId,
}: {
  value: string;
  variant?: `${SelectTriggerVariantType}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  clientPortalId?: string;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (value: string) => {
      onValueChange?.(value);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectCategoriesProvider
      value={value}
      clientPortalId={clientPortalId}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectCategoriesValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectCategoriesContent />
        </SelectContent>
      </PopoverScoped>
    </SelectCategoriesProvider>
  );
};

export const SelectCategories = Object.assign(SelectCategoriesRoot, {
  Provider: SelectCategoriesProvider,
  Value: SelectCategoriesValue,
  Content: SelectCategoriesContent,
  FilterItem: SelectCategoriesFilterItem,
  FilterView: SelectCategoriesFilterView,
  FilterBar: SelectCategoriesFilterBar,
  FormItem: SelectCategoriesFormItem,
});
