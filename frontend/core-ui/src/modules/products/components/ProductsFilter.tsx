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
import { IconBriefcase, IconCheck, IconCircleDot } from '@tabler/icons-react';
import { ComponentType } from 'react';

type OptionFilterConfig = {
  queryKey: string;
  label: string;
  placeholder: string;
  icon: ComponentType;
  options: { label: string; value: string }[];
};

const PRODUCT_TYPE_FILTER: OptionFilterConfig = {
  queryKey: 'type',
  label: 'Type',
  placeholder: 'Select type',
  icon: IconBriefcase,
  options: [
    { label: 'Product', value: 'product' },
    { label: 'Service', value: 'service' },
    { label: 'Subscription', value: 'subscription' },
    { label: 'Unique', value: 'unique' },
  ],
};

const PRODUCT_STATUS_FILTER: OptionFilterConfig = {
  queryKey: 'status',
  label: 'Status',
  placeholder: 'Select status',
  icon: IconCircleDot,
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Deleted', value: 'deleted' },
  ],
};

type OptionFilterProps = Readonly<{ config: OptionFilterConfig }>;

function OptionFilterItem({ config }: OptionFilterProps) {
  const { queryKey, label, icon: Icon } = config;
  return (
    <Filter.Item value={queryKey}>
      <Icon />
      {label}
    </Filter.Item>
  );
}

function OptionFilterView({ config }: OptionFilterProps) {
  const { queryKey, icon: Icon, options } = config;
  const [value, setValue] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey}>
      <Command className="outline-hidden">
        <Command.List className="p-1">
          {options.map((option) => (
            <Command.Item
              key={option.value}
              value={option.value}
              onSelect={() => {
                setValue(option.value);
                resetFilterState();
              }}
            >
              <Icon />
              {option.label}
              {value === option.value && <IconCheck className="ml-auto" />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

function OptionFilterBar({ config }: OptionFilterProps) {
  const { queryKey, label, placeholder, icon: Icon, options } = config;
  const [value, setValue] = useQueryState<string>(queryKey);

  if (!value) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <Icon />
        {label}
      </Filter.BarName>
      <Select value={value} onValueChange={(next) => setValue(next || null)}>
        <Select.Trigger className="h-full rounded-none border-none bg-background px-3 shadow-none focus:shadow-none gap-1">
          <Select.Value placeholder={placeholder} />
        </Select.Trigger>
        <Select.Content>
          {options.map((option) => (
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
        <OptionFilterBar config={PRODUCT_TYPE_FILTER} />
        <VendorFilterBar />
        <BrandsFilterBar />
        <TagsFilterBar />
        <OptionFilterBar config={PRODUCT_STATUS_FILTER} />
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
                <OptionFilterItem config={PRODUCT_TYPE_FILTER} />
                <SelectCompany.FilterItem value="vendorId" label="Vendor" />
                <SelectBrands.FilterItem value="brandIds" label="Brands" />
                <SelectTags.FilterItem value="tags" label="Tags" />
                <OptionFilterItem config={PRODUCT_STATUS_FILTER} />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectCategory.FilterView filterKey="categoryIds" mode="multiple" />
          <OptionFilterView config={PRODUCT_TYPE_FILTER} />
          <SelectCompany.FilterView mode="single" filterKey="vendorId" />
          <SelectBrands.FilterView mode="multiple" filterKey="brandIds" />
          <SelectTags.FilterView mode="multiple" filterKey="tags" />
          <OptionFilterView config={PRODUCT_STATUS_FILTER} />
        </Combobox.Content>
      </Filter.Popover>
    </>
  );
};
