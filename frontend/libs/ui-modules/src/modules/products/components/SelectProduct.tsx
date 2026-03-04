import {
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
  SelectProductContext,
  useSelectProductContext,
} from '../contexts/SelectProductContext';

import { IProduct } from '../types/Product';
import { IconShoppingCart } from '@tabler/icons-react';
import { ProductsInline } from './ProductsInline';
import { useDebounce } from 'use-debounce';
import { useProducts } from '../hooks/useProducts';

interface SelectProductProviderProps {
  children: React.ReactNode;
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  defaultSearchValue?: string;
}

const SelectProductProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
  defaultSearchValue,
}: SelectProductProviderProps) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const productIds = !value ? [] : Array.isArray(value) ? value : [value];
  const onSelect = (product: IProduct) => {
    if (!product) return;
    if (mode === 'single') {
      setProducts([product]);
      onValueChange?.(product._id);
      return;
    }
    const arrayValue = Array.isArray(value) ? value : [];
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
  };
  return (
    <SelectProductContext.Provider
      value={{
        productIds,
        onSelect,
        products,
        setProducts,
        loading: false,
        error: null,
        defaultSearchValue,
      }}
    >
      {children}
    </SelectProductContext.Provider>
  );
};

const SelectProductContent = () => {
  const { productIds, products, defaultSearchValue } = useSelectProductContext();
  const [search, setSearch] = useState(defaultSearchValue ?? '');
  const [debouncedSearch] = useDebounce(search, 500);
  const {
    products: productsData,
    loading,
    handleFetchMore,
    totalCount,
    error,
  } = useProducts({
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
        {products?.length > 0 && (
          <>
            {products.map((product) => (
              <SelectProductCommandItem key={product._id} product={product} />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        <Combobox.Empty loading={loading} error={error} />
        {!loading &&
          productsData
            ?.filter((product) => !productIds.includes(product._id))
            .map((product) => (
              <SelectProductCommandItem key={product._id} product={product} />
            ))}

        {!loading && (
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

const SelectProductCommandItem = ({ product }: { product: IProduct }) => {
  const { onSelect, productIds } = useSelectProductContext();
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

const SelectProductInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectProductProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectProductProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectProductValue />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectProductContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectProductProvider>
  );
};

const SelectProductRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectProductProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
      scope?: string;
    }
>(
  (
    { onValueChange, className, mode, value, placeholder, scope, defaultSearchValue, ...props },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    return (
      <SelectProductProvider
        mode={mode}
        value={value}
        defaultSearchValue={defaultSearchValue}
        onValueChange={(value) => {
          if (mode === 'single') {
            setOpen(false);
          }
          onValueChange?.(value);
        }}
      >
        <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
          <Combobox.Trigger
            className={cn('w-full inline-flex', className)}
            variant="outline"
            ref={ref}
            {...props}
          >
            <SelectProductValue />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectProductContent />
          </Combobox.Content>
        </PopoverScoped>
      </SelectProductProvider>
    );
  },
);

const SelectProductValue = ({ placeholder }: { placeholder?: string }) => {
  const { productIds, products, setProducts } = useSelectProductContext();

  if (productIds.length === 0) {
    return null;
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

export const SelectProductFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconShoppingCart />
      {label}
    </Filter.Item>
  );
};

export const SelectProductFilterView = ({
  onValueChange,
  filterKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  filterKey: string;
  mode?: 'single' | 'multiple';
}) => {
  const [product, setProduct] = useQueryState<string[] | string | undefined>(
    filterKey,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={filterKey}>
      <SelectProductProvider
        mode={mode}
        value={product || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setProduct(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectProductContent />
      </SelectProductProvider>
    </Filter.View>
  );
};

export const SelectProductFilterBar = ({
  iconOnly,
  onValueChange,
  filterKey,
  label,
  mode = 'single',
}: {
  iconOnly?: boolean;
  filterKey: string;
  label: string;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [product, setProduct] = useQueryState<string[] | string | undefined>(
    filterKey,
  );
  const [open, setOpen] = useState(false);

  if (!product) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={filterKey}>
      <Filter.BarName>
        <IconShoppingCart />
        {label}
      </Filter.BarName>
      <SelectProductProvider
        mode={mode}
        value={product || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value && value.length > 0) {
            setProduct(value as string[] | string);
          } else {
            setProduct(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={filterKey}>
              <SelectProductValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectProductContent />
          </Combobox.Content>
        </Popover>
      </SelectProductProvider>
    </Filter.BarItem>
  );
};

export const SelectProductFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectProductProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectProductProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectProductValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectProductContent />
        </Combobox.Content>
      </Popover>
    </SelectProductProvider>
  );
};

export const SelectProduct = Object.assign(SelectProductRoot, {
  Provider: SelectProductProvider,
  Content: SelectProductContent,
  Item: SelectProductCommandItem,
  InlineCell: SelectProductInlineCell,
  Value: SelectProductValue,
  FilterItem: SelectProductFilterItem,
  FilterView: SelectProductFilterView,
  FilterBar: SelectProductFilterBar,
  FormItem: SelectProductFormItem,
});
