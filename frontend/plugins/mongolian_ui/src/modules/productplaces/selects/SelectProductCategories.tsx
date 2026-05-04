import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { cn, Combobox, Command, PopoverScoped } from 'erxes-ui';

const PRODUCT_CATEGORIES_QUERY = gql`
  query productCategories($status: String, $searchValue: String) {
    productCategories(status: $status, searchValue: $searchValue) {
      _id
      name
    }
  }
`;

type ProductCategory = { _id: string; name: string };

interface SelectProductCategoriesContextType {
  value: string[];
  onValueChange: (ids: string[]) => void;
  loading?: boolean;
  error?: any;
  categories?: ProductCategory[];
}

const SelectProductCategoriesContext =
  createContext<SelectProductCategoriesContextType | null>(null);

const useSelectProductCategoriesContext = () => {
  const context = useContext(SelectProductCategoriesContext);
  if (!context) {
    throw new Error(
      'useSelectProductCategoriesContext must be used within SelectProductCategoriesProvider',
    );
  }
  return context;
};

export const SelectProductCategoriesProvider = ({
  value,
  onValueChange,
  children,
}: {
  value: string[];
  onValueChange: (ids: string[]) => void;
  children: React.ReactNode;
}) => {
  const { data, loading, error } = useQuery(PRODUCT_CATEGORIES_QUERY, {
    variables: {},
  });

  const categories: ProductCategory[] = useMemo(
    () => data?.productCategories || [],
    [data],
  );

  const contextValue = useMemo(
    () => ({
      value: value || [],
      onValueChange,
      categories,
      loading,
      error,
    }),
    [value, onValueChange, categories, loading, error],
  );

  return (
    <SelectProductCategoriesContext.Provider value={contextValue}>
      {children}
    </SelectProductCategoriesContext.Provider>
  );
};

const SelectProductCategoriesValue = ({
  placeholder,
}: {
  placeholder?: string;
}) => {
  const { value, categories } = useSelectProductCategoriesContext();
  const selectedNames = useMemo(
    () =>
      value
        .map((id) => categories?.find((c) => c._id === id)?.name)
        .filter(Boolean)
        .join(', '),
    [value, categories],
  );

  if (!selectedNames) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Choose product category'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm line-clamp-1')}>
        {selectedNames}
      </p>
    </div>
  );
};

const SelectProductCategoriesItem = ({
  category,
}: {
  category: ProductCategory;
}) => {
  const { onValueChange, value } = useSelectProductCategoriesContext();
  const selectedSet = new Set(value);

  return (
    <Command.Item
      value={category._id}
      onSelect={() => {
        const newValue = selectedSet.has(category._id)
          ? value.filter((x) => x !== category._id)
          : [...value, category._id];
        onValueChange(newValue);
      }}
    >
      <span className="font-medium">
        {selectedSet.has(category._id) && '✓ '}
        {category.name}
      </span>
      <Combobox.Check checked={selectedSet.has(category._id)} />
    </Command.Item>
  );
};

const SelectProductCategoriesContent = () => {
  const { categories, loading, error } = useSelectProductCategoriesContext();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-24 text-destructive">
          Error: {error.message}
        </div>
      );
    }

    return categories?.map((c) => (
      <SelectProductCategoriesItem key={c._id} category={c} />
    ));
  };

  return (
    <Command>
      <Command.Input placeholder="Search category" />
      <Command.Empty>
        <span className="text-muted-foreground">No categories found</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

const SelectProductCategoriesRoot = ({
  value,
  onValueChange,
  disabled,
}: {
  value: string[];
  onValueChange: (ids: string[]) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);

  const handleValueChange = useCallback(
    (ids: string[]) => {
      onValueChange(ids);
    },
    [onValueChange],
  );

  return (
    <SelectProductCategoriesProvider
      value={value}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.Trigger disabled={disabled}>
          <SelectProductCategoriesValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectProductCategoriesContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectProductCategoriesProvider>
  );
};

export default SelectProductCategoriesRoot;
