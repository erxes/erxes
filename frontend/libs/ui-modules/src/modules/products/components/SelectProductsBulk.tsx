import { IProduct } from '../types/Product';
import { ProductsInline } from './ProductsInline';
import {
  Button,
  Input,
  Sheet,
  Separator,
  ScrollArea,
  Tooltip,
  Spinner,
  cn,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { useProducts } from '../hooks/useProducts';
import { useInView } from 'react-intersection-observer';
import { AddProduct } from './AddProduct';
import { useDebounce } from 'use-debounce';
import { GET_PRODUCTS } from '../graphql/queries/productsQueries';
import { SelectCompany } from '../../contacts/components/SelectCompany';
import { SelectCategory } from '../categories/components/SelectCategory';

interface SelectProductsProps {
  onSelect: (productIds: string[], products?: IProduct[]) => void;
  children: React.ReactNode;
  productIds?: string[];
}

interface ProductsListProps {
  selectedProducts: IProduct[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<IProduct[]>>;
  selectedProductIds: string[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SelectProductsBulk = ({
  onSelect,
  children,
  productIds,
}: SelectProductsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>{children}</Sheet.Trigger>
      <Sheet.View className="sm:max-w-5xl">
        <Sheet.Header>
          <div>
            <Sheet.Title>Select Products</Sheet.Title>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <SelectProductsBulkContent
          setOpen={setOpen}
          onSelect={onSelect}
          productIds={productIds}
        />
      </Sheet.View>
    </Sheet>
  );
};

const SelectProductsBulkContent = ({
  setOpen,
  onSelect,
  productIds,
}: {
  setOpen: (open: boolean) => void;
  onSelect: (productIds: string[], products?: IProduct[]) => void;
  productIds?: string[];
}) => {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    if (productIds?.length) {
      setSelectedProductIds(productIds);
    }
  }, [productIds]);

  const handleAddProduct = (data: { productsAdd: { _id: string } }) => {
    setSelectedProductIds((prev) => [...prev, data.productsAdd._id]);
  };

  const handleSelect = () => {
    onSelect(
      selectedProducts.map((p) => p._id),
      selectedProducts,
    );
    setOpen(false);
  };

  return (
    <>
      <Sheet.Content className="grid overflow-hidden grid-cols-2">
        <ProductsList
          selectedProducts={selectedProducts}
          selectedProductIds={selectedProductIds}
          setSelectedProductIds={setSelectedProductIds}
          setSelectedProducts={setSelectedProducts}
        />
        <SelectedProductsList
          selectedProducts={selectedProducts}
          selectedProductIds={selectedProductIds}
          setSelectedProductIds={setSelectedProductIds}
          setSelectedProducts={setSelectedProducts}
        />
      </Sheet.Content>
      <Sheet.Footer className="sm:justify-between">
        <AddProduct
          options={{
            onCompleted: handleAddProduct,
            refetchQueries: [GET_PRODUCTS],
          }}
        />
        <div className="flex gap-2 items-center">
          <Sheet.Close asChild>
            <Button variant="secondary" className="bg-border">
              Cancel
            </Button>
          </Sheet.Close>
          <Button onClick={handleSelect}>Add Many Products</Button>
        </div>
      </Sheet.Footer>
    </>
  );
};

const ProductsList = ({
  setSelectedProducts,
  selectedProductIds,
  setSelectedProductIds,
}: ProductsListProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [companyId, setCompanyId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');

  const { products, handleFetchMore, totalCount } = useProducts({
    variables: {
      searchValue: debouncedSearch,
      vendorId: companyId || undefined,
      categoryIds: categoryId ? [categoryId] : undefined,
    },
  });

  const { ref: bottomRef } = useInView({
    onChange: (inView) => inView && handleFetchMore(),
  });

  const handleProductSelect = (product: IProduct) => {
    setSelectedProducts((prev) => [...prev, product]);
    setSelectedProductIds((prev) => [...prev, product._id]);
  };

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
          <div className="flex gap-2 items-center">
            <SelectCompany
              mode="single"
              value={companyId || ''}
              onValueChange={(value) => {
                setCompanyId(value as string);
              }}
            />

            <SelectCategory
              selected={categoryId}
              onSelect={
                ((id: string) => {
                  setCategoryId(id === categoryId ? '' : id);
                }) as any
              }
              variant="outline"
            />
          </div>
        </div>
        <div className="mt-4 text-xs text-accent-foreground">
          {totalCount} results
        </div>
      </div>
      <Separator />
      <ScrollArea>
        <div className="flex flex-col gap-1 p-4">
          <Tooltip.Provider>
            {products.map((product) => {
              const isSelected = selectedProductIds.includes(product._id);
              return (
                <Tooltip key={product._id}>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'min-h-9 h-auto justify-start font-normal whitespace-normal max-w-full text-left',
                        isSelected && 'bg-primary/10 hover:bg-primary/10',
                      )}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div>{product.name}</div>
                      {isSelected ? (
                        <IconCheck className="ml-auto" />
                      ) : (
                        <IconPlus className="ml-auto" />
                      )}
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <span className="opacity-50">#</span> {product.code}
                  </Tooltip.Content>
                </Tooltip>
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
          </Tooltip.Provider>
        </div>
      </ScrollArea>
    </div>
  );
};

const SelectedProductsList = ({
  selectedProducts,
  selectedProductIds,
  setSelectedProducts,
  setSelectedProductIds,
}: ProductsListProps) => {
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== productId));
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-4">
        <div className="px-3 mb-1 text-xs text-accent-foreground">Added</div>
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
