import React, { createContext, useContext, useMemo, useState } from 'react';
import { Combobox, Command, Popover, cn } from 'erxes-ui';
import { IProduct, ProductsInline } from 'ui-modules';
import { useProducts } from 'ui-modules/modules/products/hooks/useProducts';
import { useDebounce } from 'use-debounce';
import { IProductCategory } from '@/pms/types/types';

type CategoryValue = string | IProductCategory;

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  return typeof value === 'string' && value ? [value] : [];
};

interface SelectProductsContextValue {
  productIds: string[];
  onSelect: (product: IProduct) => void;
  products: IProduct[];
  setProducts: React.Dispatch<React.SetStateAction<IProduct[]>>;
  defaultSearchValue?: string;
  categoryIds?: string[];
}

const SelectProductsContext = createContext<
  SelectProductsContextValue | undefined
>(undefined);

const useSelectProductsContext = () => {
  const context = useContext(SelectProductsContext);

  if (!context) {
    throw new Error(
      'useSelectProductsContext must be used within SelectProductsProvider',
    );
  }

  return context;
};

interface SelectProductsProviderProps {
  children: React.ReactNode;
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  defaultSearchValue?: string;
  categories?: CategoryValue[];
}

const getCategoryIds = (categories?: CategoryValue[]) => {
  if (!Array.isArray(categories)) return undefined;

  return categories
    .map((category) =>
      typeof category === 'string' ? category : category?._id,
    )
    .filter((categoryId): categoryId is string => Boolean(categoryId));
};

const SelectProductsProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
  defaultSearchValue,
  categories,
}: SelectProductsProviderProps) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const productIds = useMemo(() => normalizeStringArray(value), [value]);
  const categoryIds = useMemo(() => getCategoryIds(categories), [categories]);

  const onSelect = React.useCallback(
    (product: IProduct) => {
      if (!product) return;

      if (mode === 'single') {
        setProducts([product]);
        onValueChange?.(product._id);
        return;
      }

      const arrayValue = normalizeStringArray(value);
      const isProductSelected = arrayValue.includes(product._id);
      const newSelectedProductIds = isProductSelected
        ? arrayValue.filter((id) => id !== product._id)
        : [...arrayValue, product._id];

      setProducts((prevProducts) => {
        const productMap = new Map(prevProducts.map((p) => [p._id, p]));
        productMap.set(product._id, product);

        return newSelectedProductIds
          .map((id) => productMap.get(id))
          .filter((p): p is IProduct => p !== undefined);
      });
      onValueChange?.(newSelectedProductIds);
    },
    [mode, onValueChange, value],
  );

  const contextValue = useMemo(
    () => ({
      productIds,
      onSelect,
      products,
      setProducts,
      defaultSearchValue,
      categoryIds,
    }),
    [productIds, onSelect, products, defaultSearchValue, categoryIds],
  );

  return (
    <SelectProductsContext.Provider value={contextValue}>
      {children}
    </SelectProductsContext.Provider>
  );
};

const SelectProductsContent = () => {
  const { productIds, products, defaultSearchValue, categoryIds } =
    useSelectProductsContext();
  const [search, setSearch] = useState(defaultSearchValue ?? '');
  const [debouncedSearch] = useDebounce(search, 500);
  const shouldSkip = Array.isArray(categoryIds) && categoryIds.length === 0;

  const {
    products: productsData,
    loading,
    handleFetchMore,
    totalCount,
    error,
  } = useProducts({
    skip: shouldSkip,
    variables: {
      searchValue: debouncedSearch,
      categoryIds,
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
        {products?.length > 0 && (
          <>
            {products.map((product) => (
              <SelectProductsCommandItem key={product._id} product={product} />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        <Combobox.Empty loading={loading} error={error} />
        {!loading &&
          !shouldSkip &&
          productsData
            ?.filter(
              (product) => product?._id && !productIds.includes(product._id),
            )
            .map((product) => (
              <SelectProductsCommandItem key={product._id} product={product} />
            ))}

        {!loading && !shouldSkip && (
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={productsData?.length || 0}
            totalCount={totalCount}
          />
        )}
      </Command.List>
    </Command>
  );
};

const SelectProductsCommandItem = ({ product }: { product: IProduct }) => {
  const { onSelect, productIds } = useSelectProductsContext();

  if (!product?._id) {
    return null;
  }

  return (
    <Command.Item
      value={product._id}
      onSelect={() => {
        onSelect(product);
      }}
    >
      <ProductsInline products={[product]} placeholder="Unnamed product" />
      <Combobox.Check checked={productIds.includes(product._id)} />
    </Command.Item>
  );
};

const SelectProductsRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectProductsProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
    }
>(
  (
    {
      onValueChange,
      className,
      mode,
      value,
      placeholder,
      defaultSearchValue,
      categories,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    return (
      <SelectProductsProvider
        mode={mode}
        value={value}
        defaultSearchValue={defaultSearchValue}
        categories={categories}
        onValueChange={(value) => {
          if (mode === 'single') {
            setOpen(false);
          }
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.Trigger
            className={cn('inline-flex w-full', className)}
            variant="outline"
            ref={ref}
            {...props}
          >
            <SelectProductsValue placeholder={placeholder} />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectProductsContent />
          </Combobox.Content>
        </Popover>
      </SelectProductsProvider>
    );
  },
);

const SelectProductsValue = ({ placeholder }: { placeholder?: string }) => {
  const { productIds, products, setProducts } = useSelectProductsContext();

  if (productIds.length === 0) {
    return <Combobox.Value placeholder={placeholder || 'Select products'} />;
  }

  return (
    <ProductsInline
      productIds={productIds}
      products={products}
      updateProducts={setProducts}
      placeholder={placeholder}
    />
  );
};

export const SelectProducts = Object.assign(SelectProductsRoot, {
  Provider: SelectProductsProvider,
  Content: SelectProductsContent,
  Item: SelectProductsCommandItem,
  Value: SelectProductsValue,
});
