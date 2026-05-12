import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  Select,
  useFilterContext,
  useQueryState,
  TextOverflowTooltip,
} from 'erxes-ui';
import { PRODUCTS_CURSOR_SESSION_KEY } from '@/products/constants/productsCursorSessionKey';
import { ProductsTotalCount } from '@/products/components/ProductsTotalCount';
import {
  IProductCategory,
  SelectBrands,
  SelectCompany,
  SelectTags,
} from 'ui-modules';
import { useProductCategories } from '@/products/hooks/useProductCategories';
import { IconBriefcase, IconCheck, IconFolders } from '@tabler/icons-react';
import { useState, useEffect, useCallback } from 'react';

const PRODUCT_TYPE_OPTIONS = [
  { label: 'Product', value: 'product' },
  { label: 'Service', value: 'service' },
  { label: 'Subscription', value: 'subscription' },
  { label: 'Unique', value: 'unique' },
];

interface SelectCategoriesBadgeProps {
  category?: IProductCategory;
}

function SelectCategoriesBadge(props: SelectCategoriesBadgeProps) {
  const { category } = props;
  if (!category) return null;
  const { code, name } = category;
  return (
    <div className="flex overflow-hidden flex-auto gap-2 justify-start items-center">
      <div className="text-muted-foreground">{code}</div>
      <TextOverflowTooltip value={name} className="flex-auto" />
    </div>
  );
}

interface SelectCategoriesFilterItemProps {
  value: string;
  label: string;
}

function SelectCategoriesFilterItem(props: SelectCategoriesFilterItemProps) {
  const { value, label } = props;
  return (
    <Filter.Item value={value}>
      <IconFolders />
      {label}
    </Filter.Item>
  );
}

interface SelectCategoryProps {
  category: IProductCategory;
  selectedCategory?: IProductCategory;
  onSelect: (categoryId: string) => void;
}

const CategoryOptionItem = ({
  category,
  selectedCategory,
  onSelect,
}: SelectCategoryProps) => {
  const handleSelectItem = useCallback(() => {
    onSelect(category._id);
  }, [category._id, onSelect]);

  return (
    <Command.Item
      key={category._id}
      value={category._id}
      onSelect={handleSelectItem}
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
  );
};

function SelectCategoriesFilterViewItem(props: SelectCategoryProps) {
  return <CategoryOptionItem {...props} />;
}

const CategoryItemContent = SelectCategoriesFilterViewItem;

interface SelectCategoriesFilterBarContentProps {
  productCategories?: IProductCategory[];
  selectedCategory?: IProductCategory;
  onSelect: (categoryId: string) => void;
}

function SelectCategoriesFilterBarContent(
  props: SelectCategoriesFilterBarContentProps,
): JSX.Element {
  const { productCategories, selectedCategory, onSelect } = props;
  return (
    <Combobox.Content>
      <Command className="outline-hidden">
        <Command.Input placeholder="Search categories" />
        <Command.List>
          {productCategories?.map((category: IProductCategory) => (
            <CategoryItemContent
              key={category._id}
              category={category}
              selectedCategory={selectedCategory}
              onSelect={onSelect}
            />
          ))}
        </Command.List>
      </Command>
    </Combobox.Content>
  );
}

interface SelectCategoriesFilterBarProps {
  filterKey: string;
  label: string;
}

function SelectCategoriesFilterBar(
  props: SelectCategoriesFilterBarProps,
): JSX.Element | null {
  const { filterKey, label } = props;
  const [query, setQuery] = useQueryState<string[]>(filterKey);
  const [isOpen, setIsOpen] = useState<boolean>(false);
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

  if (!query?.length) {
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
    setIsOpen(false);
  };

  return (
    <Filter.BarItem queryKey={filterKey}>
      <Filter.BarName>
        <IconFolders />
        {label}
      </Filter.BarName>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={filterKey}>
            <SelectCategoriesBadge category={selectedCategory} />
            {!selectedCategory && (
              <Combobox.Value placeholder="Select category" />
            )}
          </Filter.BarButton>
        </Popover.Trigger>
        <SelectCategoriesFilterBarContent
          productCategories={productCategories}
          selectedCategory={selectedCategory}
          onSelect={handleSelect}
        />
      </Popover>
    </Filter.BarItem>
  );
}

interface SelectCategoriesFilterViewProps {
  filterKey: string;
}

function SelectCategoriesFilterView(
  props: SelectCategoriesFilterViewProps,
): JSX.Element {
  const { filterKey } = props;
  const [query, setQuery] = useQueryState<string[] | undefined>(filterKey);
  const { resetFilterState } = useFilterContext();
  const [selectedCategory, setSelectedCategory] = useState<IProductCategory>();
  const { productCategories, loading: isLoading } = useProductCategories({
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

  useEffect(() => {
    if (!productCategories) return;

    if (!query || query.length === 0) {
      setSelectedCategory(undefined);
    } else {
      const matchingCategory = productCategories.find(
        (category: IProductCategory) => category._id === query[0],
      );
      setSelectedCategory(matchingCategory);
    }
  }, [query, productCategories]);

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
          {isLoading ? (
            <Combobox.Empty loading={isLoading} />
          ) : !productCategories?.length ? (
            <Command.Empty>
              <div className="flex flex-col gap-2 justify-center items-center text-sm text-center text-muted-foreground">
                No categories found
              </div>
            </Command.Empty>
          ) : null}
          {productCategories?.map((category: IProductCategory) => (
            <CategoryItemContent
              key={category._id}
              category={category}
              selectedCategory={selectedCategory}
              onSelect={handleSelect}
            />
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

function ProductTypeFilterItem() {
  return (
    <Filter.Item value="type">
      <IconBriefcase />
      Type
    </Filter.Item>
  );
}

function ProductTypeFilterView() {
  const [type, setType] = useQueryState<string>('type');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="type">
      <Command className="outline-hidden">
        <Command.List className="p-1">
          {PRODUCT_TYPE_OPTIONS.map((option) => (
            <Command.Item
              key={option.value}
              value={option.value}
              onSelect={() => {
                setType(option.value);
                resetFilterState();
              }}
            >
              <IconBriefcase />
              {option.label}
              {type === option.value && <IconCheck className="ml-auto" />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

function ProductTypeFilterBar() {
  const [type, setType] = useQueryState<string>('type');

  if (!type) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="type">
      <Filter.BarName>
        <IconBriefcase />
        Type
      </Filter.BarName>
      <Select
        value={type || ''}
        onValueChange={(value) => setType(value || null)}
      >
        <Filter.BarButton filterKey="type">
          <Select.Value placeholder="Select type" />
        </Filter.BarButton>
        <Select.Content>
          {PRODUCT_TYPE_OPTIONS.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </Filter.BarItem>
  );
}

function VendorFilterBar() {
  const [vendorId] = useQueryState<string>('vendorId');

  if (!vendorId) {
    return null;
  }

  return (
    <SelectCompany.FilterBar
      mode="single"
      filterKey="vendorId"
      label="Vendor"
    />
  );
}

function BrandsFilterBar() {
  const [brandIds] = useQueryState<string[]>('brandIds');

  if (!brandIds?.length) {
    return null;
  }

  return (
    <SelectBrands.FilterBar
      mode="multiple"
      filterKey="brandIds"
      label="Brands"
    />
  );
}

function TagsFilterBar() {
  const [tags] = useQueryState<string[]>('tags');

  if (!tags?.length) {
    return null;
  }

  return (
    <SelectTags.FilterBar
      mode="multiple"
      filterKey="tags"
      label="Tags"
      tagType="core:product"
    />
  );
}

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
        <ProductTypeFilterBar />
        <VendorFilterBar />
        <BrandsFilterBar />
        <TagsFilterBar />
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
                  label="Category"
                />
                <ProductTypeFilterItem />
                <SelectCompany.FilterItem value="vendorId" label="Vendor" />
                <SelectBrands.FilterItem value="brandIds" label="Brands" />
                <SelectTags.FilterItem value="tags" label="Tags" />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectCategoriesFilterView filterKey="categoryIds" />
          <ProductTypeFilterView />
          <SelectCompany.FilterView mode="single" filterKey="vendorId" />
          <SelectBrands.FilterView mode="multiple" filterKey="brandIds" />
          <SelectTags.FilterView mode="multiple" filterKey="tags" />
        </Combobox.Content>
      </Filter.Popover>
    </>
  );
};
