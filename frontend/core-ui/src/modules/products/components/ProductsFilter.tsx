import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
  TextOverflowTooltip,
} from 'erxes-ui';
import { PRODUCTS_CURSOR_SESSION_KEY } from '../constants/productsCursorSessionKey';
import { ProductsTotalCount } from './ProductsTotalCount';
import { IProductCategory } from 'ui-modules';
import { useProductCategories } from '../hooks/useProductCategories';
import { IconFolders, IconCheck } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

export const ProductsFilter = () => {
  return (
    <Filter id="products-filter" sessionKey={PRODUCTS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <ProductsFilterPopover />
        <Filter.Dialog>
          <Filter.View filterKey="searchValue" inDialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.View>
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        <SelectCategoriesFilterBar filterKey="categoryIds" label="Category" />
        <ProductsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};

export const ProductsFilterPopover = () => {
  return (
    <>
      <Filter.Popover scope={ProductHotKeyScope.ProductsPage}>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder="Filter" variant="secondary" />

              <Command.List className="p-1">
                <Filter.SearchValueTrigger />
                <SelectCategoriesFilterItem
                  value="categoryIds"
                  label="category"
                />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectCategoriesFilterView filterKey="categoryIds" />
        </Combobox.Content>
      </Filter.Popover>
    </>
  );
};

const SelectCategoriesBadge = ({
  category,
}: {
  category?: IProductCategory;
}) => {
  if (!category) return null;
  const { code, name } = category;
  return (
    <div className="flex overflow-hidden flex-auto gap-2 justify-start items-center">
      <div className="text-muted-foreground">{code}</div>
      <TextOverflowTooltip value={name} className="flex-auto" />
    </div>
  );
};

const SelectCategoriesFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconFolders />
      {label}
    </Filter.Item>
  );
};

const SelectCategoriesFilterView = ({ filterKey }: { filterKey: string }) => {
  const [query, setQuery] = useQueryState<string[] | undefined>(filterKey);
  const { resetFilterState } = useFilterContext();
  const [selectedCategory, setSelectedCategory] = useState<IProductCategory>();
  const { productCategories, loading } = useProductCategories({
    onCompleted: ({
      productCategories,
    }: {
      productCategories: IProductCategory[];
    }) => {
      if (query && query.length > 0) {
        setSelectedCategory(
          productCategories?.find(
            (category: IProductCategory) => category._id === query[0],
          ),
        );
      }
    },
  });

  const handleSelect = (categoryId: string) => {
    const category = productCategories?.find(
      (category: IProductCategory) => category._id === categoryId,
    );
    setSelectedCategory(category);
    setQuery([categoryId]);
    resetFilterState();
  };

  return (
    <Filter.View filterKey={filterKey}>
      <Command className="outline-hidden">
        <Command.Input placeholder="Search categories" />
        <Command.List>
          {loading ? (
            <Combobox.Empty loading={loading} />
          ) : !productCategories?.length ? (
            <Command.Empty>
              <div className="flex flex-col gap-2 justify-center items-center text-sm text-center text-muted-foreground">
                No categories found
              </div>
            </Command.Empty>
          ) : null}
          {productCategories?.map((category: IProductCategory) => (
            <Command.Item
              key={category._id}
              value={category._id}
              onSelect={() => handleSelect(category._id)}
            >
              <div className="flex flex-auto gap-2 items-center">
                <span className="text-muted-foreground">{category.code}</span>
                <TextOverflowTooltip
                  value={category.name}
                  className="flex-auto w-auto font-medium"
                />
              </div>
              {selectedCategory?._id === category._id && <IconCheck />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};

const SelectCategoriesFilterBar = ({
  filterKey,
  label,
}: {
  filterKey: string;
  label: string;
}) => {
  const [query, setQuery] = useQueryState<string[]>(filterKey);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<IProductCategory>();
  const { productCategories } = useProductCategories();

  useEffect(() => {
    if (query && query.length > 0 && productCategories) {
      setSelectedCategory(
        productCategories.find(
          (category: IProductCategory) => category._id === query[0],
        ),
      );
    }
  }, [query, productCategories]);

  if (!query || query.length === 0) {
    return null;
  }

  const handleSelect = (categoryId: string) => {
    const category = productCategories?.find(
      (category: IProductCategory) => category._id === categoryId,
    );
    setSelectedCategory(category);
    if (categoryId) {
      setQuery([categoryId]);
    } else {
      setQuery(null);
    }
    setOpen(false);
  };

  return (
    <Filter.BarItem queryKey={filterKey}>
      <Filter.BarName>
        <IconFolders />
        {label}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={filterKey}>
            <SelectCategoriesBadge category={selectedCategory} />
            {!selectedCategory && (
              <Combobox.Value placeholder="Select category" />
            )}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command className="outline-hidden">
            <Command.Input placeholder="Search categories" />
            <Command.List>
              {productCategories?.map((category: IProductCategory) => (
                <Command.Item
                  key={category._id}
                  value={category._id}
                  onSelect={() => handleSelect(category._id)}
                >
                  <div className="flex flex-auto gap-2 items-center">
                    <span className="text-muted-foreground">
                      {category.code}
                    </span>
                    <TextOverflowTooltip
                      value={category.name}
                      className="flex-auto w-auto font-medium"
                    />
                  </div>
                  {selectedCategory?._id === category._id && <IconCheck />}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
