import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { cn, Combobox, Command, PopoverScoped } from 'erxes-ui';

const PRODUCTS_QUERY = gql`
  query products($ids: [String], $excludeIds: Boolean, $searchValue: String) {
    products(ids: $ids, excludeIds: $excludeIds, searchValue: $searchValue) {
      _id
      name
    }
  }
`;

type Product = { _id: string; name: string };

interface SelectProductsContextType {
  value: string[];
  onValueChange: (ids: string[]) => void;
  loading?: boolean;
  error?: any;
  products?: Product[];
}

const SelectProductsContext = createContext<SelectProductsContextType | null>(
  null,
);

const useSelectProductsContext = () => {
  const context = useContext(SelectProductsContext);
  if (!context) {
    throw new Error(
      'useSelectProductsContext must be used within SelectProductsProvider',
    );
  }
  return context;
};

export const SelectProductsProvider = ({
  value,
  onValueChange,
  ids = [],
  excludeIds,
  searchValue,
  children,
}: {
  value: string[];
  onValueChange: (ids: string[]) => void;
  ids?: string[];
  excludeIds?: boolean;
  searchValue?: string;
  children: React.ReactNode;
}) => {
  const { data, loading, error } = useQuery(PRODUCTS_QUERY, {
    variables: { ids, excludeIds, searchValue },
  });

  const products: Product[] = useMemo(() => data?.products || [], [data]);

  const contextValue = useMemo(
    () => ({
      value: value || [],
      onValueChange,
      products,
      loading,
      error,
    }),
    [value, onValueChange, products, loading, error],
  );

  return (
    <SelectProductsContext.Provider value={contextValue}>
      {children}
    </SelectProductsContext.Provider>
  );
};

const SelectProductsValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, products } = useSelectProductsContext();
  const selectedNames = useMemo(
    () =>
      value
        .map((id) => products?.find((p) => p._id === id)?.name)
        .filter(Boolean)
        .join(', '),
    [value, products],
  );

  if (!selectedNames) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Choose products'}
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

const SelectProductsItem = ({ product }: { product: Product }) => {
  const { onValueChange, value } = useSelectProductsContext();
  const selectedSet = new Set(value);

  return (
    <Command.Item
      value={product._id}
      onSelect={() => {
        const newValue = selectedSet.has(product._id)
          ? value.filter((x) => x !== product._id)
          : [...value, product._id];
        onValueChange(newValue);
      }}
    >
      <span className="font-medium">
        {selectedSet.has(product._id) && '✓ '}
        {product.name}
      </span>
      <Combobox.Check checked={selectedSet.has(product._id)} />
    </Command.Item>
  );
};

const SelectProductsContent = () => {
  const { products, loading, error } = useSelectProductsContext();

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

    return products?.map((p) => (
      <SelectProductsItem key={p._id} product={p} />
    ));
  };

  return (
    <Command>
      <Command.Input placeholder="Search product" />
      <Command.Empty>
        <span className="text-muted-foreground">No products found</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

const SelectProductsRoot = ({
  value,
  onValueChange,
  ids = [],
  excludeIds,
  searchValue,
  disabled,
}: {
  value: string[];
  onValueChange: (ids: string[]) => void;
  ids?: string[];
  excludeIds?: boolean;
  searchValue?: string;
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
    <SelectProductsProvider
      value={value}
      onValueChange={handleValueChange}
      ids={ids}
      excludeIds={excludeIds}
      searchValue={searchValue}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.Trigger disabled={disabled}>
          <SelectProductsValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectProductsContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectProductsProvider>
  );
};

export default SelectProductsRoot;
