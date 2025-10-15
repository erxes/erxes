import { IProduct } from 'ui-modules/modules';
import {
  Button,
  Combobox,
  Command,
  Filter,
  Input,
  Sheet,
  Separator,
  ScrollArea,
  Tooltip,
  Spinner,
} from 'erxes-ui';
import { useState } from 'react';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useProducts } from '../hooks/useProducts';
import { useInView } from 'react-intersection-observer';

export const SelectProductsBulk = ({
  onSelect,
  children,
}: {
  onSelect: (productIds: string[], products?: IProduct[]) => void;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>{children}</Sheet.Trigger>
      <Sheet.View className="sm:max-w-screen-lg">
        <Sheet.Header>
          <div>
            <Sheet.Title>Select Products</Sheet.Title>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <SelectProductsBulkContent setOpen={setOpen} onSelect={onSelect} />
      </Sheet.View>
    </Sheet>
  );
};

export const SelectProductsBulkContent = ({
  setOpen,
  onSelect,
}: {
  setOpen: (open: boolean) => void;
  onSelect: (productIds: string[], products?: IProduct[]) => void;
}) => {
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);
  return (
    <>
      <Sheet.Content className="grid grid-cols-2 overflow-hidden">
        <ProductsList
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />
        <SelectedProductsList
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />
      </Sheet.Content>
      <Sheet.Footer>
        <Sheet.Close asChild>
          <Button variant="secondary" className="bg-border">
            Cancel
          </Button>
        </Sheet.Close>
        <Button
          onClick={() => {
            onSelect(
              selectedProducts.map((p) => p._id),
              selectedProducts,
            );
            setOpen(false);
          }}
        >
          Add Many Products
        </Button>
      </Sheet.Footer>
    </>
  );
};

export const ProductsList = ({
  selectedProducts,
  setSelectedProducts,
}: {
  selectedProducts: IProduct[];
  setSelectedProducts: (products: IProduct[]) => void;
}) => {
  const { products, loading, handleFetchMore, totalCount, error } =
    useProducts();

  const { ref: bottomRef } = useInView({
    onChange: (inView) => inView && handleFetchMore(),
  });

  return (
    <div className="border-r overflow-hidden flex flex-col">
      <div className="p-4">
        <Filter id="products-list-filter">
          <div className="flex items-center gap-4">
            <Input placeholder="Search products" />

            <Filter.Popover scope="products-list-filter">
              <Filter.Trigger />
              <Combobox.Content>
                <Filter.View>
                  <Command>
                    <Filter.CommandInput
                      placeholder="Filter"
                      variant="secondary"
                      className="bg-background"
                    />
                    <Command.List className="p-1">
                      <Filter.Item value="searchValue" inDialog>
                        <IconSearch />
                        Search
                      </Filter.Item>
                    </Command.List>
                  </Command>
                </Filter.View>
              </Combobox.Content>
            </Filter.Popover>
          </div>
        </Filter>
        <div className="text-accent-foreground text-xs mt-4">
          {totalCount} results
        </div>
      </div>
      <Separator />
      <ScrollArea>
        <div className="p-4 flex flex-col gap-1">
          <Tooltip.Provider>
            {products.map(
              (product) =>
                !selectedProducts.includes(product) && (
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <Button
                        key={product._id}
                        variant="ghost"
                        className="min-h-9 h-auto justify-start font-normal whitespace-normal max-w-full text-left"
                        onClick={() => {
                          setSelectedProducts([...selectedProducts, product]);
                        }}
                      >
                        <div>{product.name}</div>
                        <IconPlus className="ml-auto" />
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <span className="opacity-50">#</span> {product.code}
                    </Tooltip.Content>
                  </Tooltip>
                ),
            )}

            {products.length < totalCount && (
              <div className="flex items-center gap-2 px-2 h-8" ref={bottomRef}>
                <Spinner containerClassName="flex-none" />
                <span className="text-accent-foreground animate-pulse">
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

export const SelectedProductsList = ({
  selectedProducts,
  setSelectedProducts,
}: {
  selectedProducts: IProduct[];
  setSelectedProducts: (products: IProduct[]) => void;
}) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 flex flex-col gap-1">
        <div className="text-accent-foreground text-xs px-3 mb-1">Added</div>
        <Tooltip.Provider>
          {selectedProducts.map((product) => (
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  key={product._id}
                  variant="ghost"
                  className="min-h-9 h-auto justify-start font-normal whitespace-normal max-w-full text-left"
                  onClick={() => {
                    setSelectedProducts(
                      selectedProducts.filter((p) => p._id !== product._id),
                    );
                  }}
                >
                  <div>{product.name}</div>
                  <IconX className="ml-auto" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <span className="opacity-50">#</span> {product.code}
              </Tooltip.Content>
            </Tooltip>
          ))}
        </Tooltip.Provider>
      </div>
    </ScrollArea>
  );
};
