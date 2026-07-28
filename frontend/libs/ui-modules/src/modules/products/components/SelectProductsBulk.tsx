import { IProduct } from '../types/Product';
import { ProductsInline } from './ProductsInline';
import {
  Button,
  Input,
  Sheet,
  Separator,
  ScrollArea,
  Spinner,
  useQueryState,
  fixNum,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { IconPlus, IconX } from '@tabler/icons-react';
import { useProducts } from '../hooks/useProducts';
import { useInView } from 'react-intersection-observer';
import { AddProduct } from './AddProduct';
import { useDebounce } from 'use-debounce';
import { GET_PRODUCTS } from '../graphql/queries/productsQueries';
import { SelectCompany } from '../../contacts/components/SelectCompany';
import { SelectCategory } from '../categories/components/SelectCategory';

interface SelectProductsProps {
  onSelect: (
    productIds: string[],
    products?: IProduct[],
  ) => void | Promise<void>;
  children?: React.ReactNode;
  productIds?: string[];
  initialProducts?: IProduct[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectionLimit?: number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  submitLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  selectedLabel?: React.ReactNode;
  isSelectionValid?: (productIds: string[], products: IProduct[]) => boolean;
}

interface SelectProductsBulkContentProps
  extends Pick<
      SelectProductsProps,
      | 'onSelect'
      | 'productIds'
      | 'initialProducts'
      | 'selectionLimit'
      | 'isSelectionValid'
    >,
    Required<
      Pick<SelectProductsProps, 'submitLabel' | 'cancelLabel' | 'selectedLabel'>
    > {
  setOpen: (open: boolean) => void;
}

interface ProductsListProps {
  selectedProducts: IProduct[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<IProduct[]>>;
  selectedProductIds: string[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectionLimit?: number;
}

export const SelectProductsBulk = ({
  onSelect,
  children,
  productIds,
  initialProducts,
  open,
  onOpenChange,
  selectionLimit,
  title = 'Select Products',
  description,
  submitLabel = 'Add Many Products',
  cancelLabel = 'Cancel',
  selectedLabel = 'Added',
  isSelectionValid,
}: SelectProductsProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const resolvedOpen = open ?? internalOpen;

  const setOpen = (nextOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  return (
    <Sheet open={resolvedOpen} onOpenChange={setOpen}>
      {children && <Sheet.Trigger asChild>{children}</Sheet.Trigger>}
      <Sheet.View className="sm:max-w-6xl">
        <Sheet.Header>
          <div>
            <Sheet.Title>{title}</Sheet.Title>
            {description && (
              <Sheet.Description>{description}</Sheet.Description>
            )}
          </div>
          <Sheet.Close />
        </Sheet.Header>
        {resolvedOpen && (
          <SelectProductsBulkContent
            setOpen={setOpen}
            onSelect={onSelect}
            productIds={productIds}
            initialProducts={initialProducts}
            selectionLimit={selectionLimit}
            submitLabel={submitLabel}
            cancelLabel={cancelLabel}
            selectedLabel={selectedLabel}
            isSelectionValid={isSelectionValid}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};

const SelectProductsBulkContent = ({
  setOpen,
  onSelect,
  productIds,
  initialProducts,
  selectionLimit,
  submitLabel,
  cancelLabel,
  selectedLabel,
  isSelectionValid,
}: SelectProductsBulkContentProps) => {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    productIds || [],
  );
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>(
    initialProducts || [],
  );
  const [submitting, setSubmitting] = useState(false);

  const handleAddProduct = (data: { productsAdd: { _id: string } }) => {
    if (
      selectionLimit !== undefined &&
      selectedProductIds.length >= selectionLimit
    ) {
      return;
    }
    setSelectedProductIds((prev) => [...prev, data.productsAdd._id]);
  };

  const handleSelect = async () => {
    setSubmitting(true);
    try {
      await onSelect(selectedProductIds, selectedProducts);
      setOpen(false);
    } catch {
      // The consuming mutation displays its own error state.
    } finally {
      setSubmitting(false);
    }
  };
  const allSelectedProductsResolved = selectedProductIds.every((productId) =>
    selectedProducts.some((product) => product._id === productId),
  );
  const selectionLimitReached =
    selectionLimit !== undefined && selectedProductIds.length >= selectionLimit;
  const selectionIsValid =
    isSelectionValid?.(selectedProductIds, selectedProducts) ?? true;

  return (
    <>
      <Sheet.Content className="grid overflow-hidden grid-cols-2">
        <ProductsList
          selectedProducts={selectedProducts}
          selectedProductIds={selectedProductIds}
          setSelectedProductIds={setSelectedProductIds}
          setSelectedProducts={setSelectedProducts}
          selectionLimit={selectionLimit}
        />
        <SelectedProductsList
          selectedProducts={selectedProducts}
          selectedProductIds={selectedProductIds}
          setSelectedProductIds={setSelectedProductIds}
          setSelectedProducts={setSelectedProducts}
          selectedLabel={selectedLabel}
        />
      </Sheet.Content>
      <Sheet.Footer className="sm:justify-between">
        <AddProduct
          options={{
            onCompleted: handleAddProduct,
            refetchQueries: [GET_PRODUCTS],
          }}
        >
          <Button variant="outline" disabled={selectionLimitReached}>
            <IconPlus />
            Create new product
          </Button>
        </AddProduct>
        <div className="ml-auto flex gap-2 items-center">
          <Sheet.Close asChild>
            <Button variant="secondary" className="bg-border">
              {cancelLabel}
            </Button>
          </Sheet.Close>
          <Button
            onClick={handleSelect}
            disabled={
              submitting ||
              selectedProductIds.length === 0 ||
              !allSelectedProductsResolved ||
              !selectionIsValid
            }
          >
            {submitLabel}
          </Button>
        </div>
      </Sheet.Footer>
    </>
  );
};

const ProductsList = ({
  setSelectedProducts,
  selectedProductIds,
  setSelectedProductIds,
  selectionLimit,
}: ProductsListProps) => {
  const [search, setSearch] = useState(
    () => localStorage.getItem('search') || '',
  );
  const [debouncedSearch] = useDebounce(search, 500);
  const [companyId, setCompanyId] = useState<string>(
    () => localStorage.getItem('companyId') || '',
  );
  const [categoryId, setCategoryId] = useState<string>(
    () => localStorage.getItem('categoryId') || '',
  );
  const [pipelineId] = useQueryState<string>('pipelineId');

  useEffect(() => {
    localStorage.setItem('search', debouncedSearch);
    localStorage.setItem('companyId', companyId);
    localStorage.setItem('categoryId', categoryId);
  }, [debouncedSearch, companyId, categoryId]);
  const { products, handleFetchMore, totalCount } = useProducts({
    variables: {
      searchValue: debouncedSearch,
      vendorId: companyId || undefined,
      categoryIds: categoryId ? [categoryId] : undefined,
      pipelineId: pipelineId || undefined,
    },
  });

  const { ref: bottomRef } = useInView({
    onChange: (inView) => inView && handleFetchMore(),
  });

  const handleProductSelect = (product: IProduct) => {
    if (
      selectionLimit !== undefined &&
      selectedProductIds.length >= selectionLimit
    ) {
      return;
    }
    setSelectedProducts((prev) => [...prev, product]);
    setSelectedProductIds((prev) => [...prev, product._id]);
  };

  const selectionLimitReached =
    selectionLimit !== undefined && selectedProductIds.length >= selectionLimit;
  const unselectedProducts = products
    .filter((p) => !selectedProductIds.includes(p._id))
    .sort(
      (a, b) => (b.remainder?.remainder ?? 0) - (a.remainder?.remainder ?? 0),
    );

  return (
    <div className="flex overflow-hidden flex-col border-r">
      <div className="p-4">
        <div className="flex gap-4 justify-between items-center">
          <div className="flex flex-1 gap-4 items-center">
            <Input
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <SelectCompany
              mode="single"
              value={companyId || ''}
              onValueChange={(value) => {
                if (companyId === value) setCompanyId('');
                else setCompanyId(value as string);
              }}
              className="max-w-40"
            />

            <SelectCategory
              selected={categoryId}
              onSelect={(value) => {
                if (typeof value !== 'string') {
                  return;
                }
                setCategoryId(value === categoryId ? '' : value);
              }}
              variant="outline"
            />
          </div>
        </div>
        <div className="mt-4 text-xs text-accent-foreground">
          {totalCount} results
        </div>
      </div>
      <Separator />
      <div className="overflow-auto flex-1">
        <div className="flex flex-col gap-1 p-4 min-w-max">
          {unselectedProducts.map((product) => {
            return (
              <Button
                key={product._id}
                variant="ghost"
                className="min-h-9 h-auto w-full justify-start font-normal whitespace-nowrap text-left"
                disabled={selectionLimitReached}
                onClick={() => handleProductSelect(product)}
              >
                <div className="flex flex-1 gap-2 items-center">
                  <span className="font-mono text-xs bg-muted border rounded px-1.5 py-0.5 text-muted-foreground shrink-0">
                    {product.code}
                  </span>
                  <span className="truncate">{product.name}</span>
                  <span className="ml-auto flex items-center gap-2 shrink-0">
                    <span className="text-xs tabular-nums font-medium">
                      <span className="text-muted-foreground font-normal mr-0.5">
                        {product.currency ?? ''}
                      </span>
                      {fixNum(product.unitPrice).toLocaleString()}
                    </span>
                    <span className="text-xs bg-muted border rounded px-1.5 py-0.5 text-muted-foreground tabular-nums">
                      {product.remainder.remainder ?? 0} {product.uom ?? ''}
                    </span>
                  </span>
                </div>
                <IconPlus className="ml-2 shrink-0" />
              </Button>
            );
          })}

          {products.length < totalCount && (
            <div className="flex gap-2 items-center px-2 h-8" ref={bottomRef}>
              <Spinner containerClassName="flex-none" />
              <span className="animate-pulse text-accent-foreground">
                Loading more products...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SelectedProductsList = ({
  selectedProducts,
  selectedProductIds,
  setSelectedProducts,
  setSelectedProductIds,
  selectedLabel,
}: ProductsListProps & { selectedLabel: React.ReactNode }) => {
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== productId));
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-4">
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          {selectedLabel}
        </div>
        {selectedProductIds.map((productId) => {
          const product = selectedProducts.find((p) => p._id === productId);
          return (
            <Button
              key={productId}
              variant="ghost"
              className="justify-start max-w-full h-auto font-normal text-left whitespace-normal min-h-9"
              onClick={() => handleRemoveProduct(productId)}
            >
              <ProductsInline
                productIds={[productId]}
                products={product ? [product] : []}
                updateProducts={(products) =>
                  setSelectedProducts((prev) => [...prev, ...products])
                }
              />
              <IconX className="ml-auto" />
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
