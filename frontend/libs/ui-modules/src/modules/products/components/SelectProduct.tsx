import {
  SelectProductContext,
  useSelectProductContext,
} from '../contexts/SelectProductContext';
import { IProduct } from '../types/Product';
import { useProducts } from '../hooks/useProducts';
import { useDebounce } from 'use-debounce';
import React, { useState } from 'react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  useFilterContext,
  useQueryState,
  RecordTableInlineCell,
} from 'erxes-ui';
import { ProductsInline } from './ProductsInline';
import { IconShoppingCart } from '@tabler/icons-react';

interface SelectProductProviderProps {
  children: React.ReactNode;
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}

const SelectProductProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
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
      }}
    >
      {children}
    </SelectProductContext.Provider>
  );
};

const SelectProductContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { productIds, products } = useSelectProductContext();
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
    { onValueChange, className, mode, value, placeholder, scope, ...props },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    return (
      <SelectProductProvider
        mode={mode}
        value={value}
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

  return (
    <ProductsInline
      productIds={productIds}
      products={products}
      updateProducts={setProducts}
      placeholder={placeholder}
    />
  );
};

export const SelectProductFilterItem = () => {
  return (
    <Filter.Item value="product">
      <IconShoppingCart />
      Product
    </Filter.Item>
  );
};

export const SelectProductFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [product, setProduct] = useQueryState<string[] | string>(
    queryKey || 'product',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'product'}>
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
  queryKey,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [product, setProduct] = useQueryState<string[] | string>(
    queryKey || 'product',
  );
  const [open, setOpen] = useState(false);

  if (!product) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={queryKey || 'product'}>
      <Filter.BarName>
        <IconShoppingCart />
        {!iconOnly && 'Products'}
      </Filter.BarName>
      <SelectProductProvider
        mode={mode}
        value={product || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
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
            <Filter.BarButton filterKey={queryKey || 'product'}>
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
