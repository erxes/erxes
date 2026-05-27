import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import {
  Combobox,
  Command,
  Filter,
  Select,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { PRODUCTS_CURSOR_SESSION_KEY } from '@/products/constants/productsCursorSessionKey';
import { ProductsTotalCount } from '@/products/components/ProductsTotalCount';
import {
  SelectBrands,
  SelectCategory,
  SelectCompany,
  SelectTags,
} from 'ui-modules';
import { IconBriefcase, IconCheck } from '@tabler/icons-react';

const PRODUCT_TYPE_OPTIONS = [
  { label: 'Product', value: 'product' },
  { label: 'Service', value: 'service' },
  { label: 'Subscription', value: 'subscription' },
  { label: 'Unique', value: 'unique' },
];

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
        <SelectCategory.FilterBar
          filterKey="categoryIds"
          label="Category"
          mode="multiple"
        />
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
                <SelectCategory.FilterItem
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
          <SelectCategory.FilterView filterKey="categoryIds" mode="multiple" />
          <ProductTypeFilterView />
          <SelectCompany.FilterView mode="single" filterKey="vendorId" />
          <SelectBrands.FilterView mode="multiple" filterKey="brandIds" />
          <SelectTags.FilterView mode="multiple" filterKey="tags" />
        </Combobox.Content>
      </Filter.Popover>
    </>
  );
};
