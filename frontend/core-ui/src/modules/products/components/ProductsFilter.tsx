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
  PropertiesFilter,
  SegmentsFilter,
  TagsFilter,
} from 'ui-modules';
import { IconBriefcase, IconCheck, IconCircleDot } from '@tabler/icons-react';
import { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

type OptionFilterConfig = {
  queryKey: string;
  labelKey: string;
  placeholderKey: string;
  icon: ComponentType;
  options: { labelKey: string; value: string }[];
};

const PRODUCT_TYPE_FILTER: OptionFilterConfig = {
  queryKey: 'type',
  labelKey: 'type',
  placeholderKey: 'select-type',
  icon: IconBriefcase,
  options: [
    { labelKey: 'product', value: 'product' },
    { labelKey: 'type-service', value: 'service' },
    { labelKey: 'type-subscription', value: 'subscription' },
    { labelKey: 'type-unique', value: 'unique' },
  ],
};

const PRODUCT_STATUS_FILTER: OptionFilterConfig = {
  queryKey: 'status',
  labelKey: 'filter-status',
  placeholderKey: 'select-status',
  icon: IconCircleDot,
  options: [
    { labelKey: 'status-active', value: 'active' },
    { labelKey: 'status-deleted', value: 'deleted' },
  ],
};

type OptionFilterProps = Readonly<{ config: OptionFilterConfig }>;

function OptionFilterItem({ config }: OptionFilterProps) {
  const { t } = useTranslation('product');
  const { queryKey, labelKey, icon: Icon } = config;
  return (
    <Filter.Item value={queryKey}>
      <Icon />
      {t(labelKey)}
    </Filter.Item>
  );
}

function OptionFilterView({ config }: OptionFilterProps) {
  const { t } = useTranslation('product');
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
              {t(option.labelKey)}
              {value === option.value && <IconCheck className="ml-auto" />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

function OptionFilterBar({ config }: OptionFilterProps) {
  const { t } = useTranslation('product');
  const { queryKey, labelKey, placeholderKey, icon: Icon, options } = config;
  const [value, setValue] = useQueryState<string>(queryKey);

  if (!value) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <Icon />
        {t(labelKey)}
      </Filter.BarName>
      <Select value={value} onValueChange={(next) => setValue(next || null)}>
        <Select.Trigger className="h-full rounded-none border-none bg-background px-3 shadow-none focus:shadow-none gap-1">
          <Select.Value placeholder={t(placeholderKey)} />
        </Select.Trigger>
        <Select.Content>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {t(option.labelKey)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </Filter.BarItem>
  );
}

function VendorFilterBar() {
  const { t } = useTranslation('product');
  const [vendorId] = useQueryState<string>('vendorId');

  if (!vendorId) {
    return null;
  }

  return (
    <SelectCompany.FilterBar
      mode="single"
      filterKey="vendorId"
      label={t('vendor')}
    />
  );
}

function BrandsFilterBar() {
  const { t } = useTranslation('product');
  const [brandIds] = useQueryState<string[]>('brandIds');

  if (!brandIds?.length) {
    return null;
  }

  return (
    <SelectBrands.FilterBar
      mode="multiple"
      filterKey="brandIds"
      label={t('brands')}
    />
  );
}

export const ProductsFilter = () => {
  const { t } = useTranslation('product');
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
          label={t('category')}
          mode="multiple"
        />
        <OptionFilterBar config={PRODUCT_TYPE_FILTER} />
        <VendorFilterBar />
        <BrandsFilterBar />
        <TagsFilter.Bar tagType="core:product" />
        <SegmentsFilter.Bar contentType="core:products.products" />
        <PropertiesFilter.Bar contentType="core:product" />
        <OptionFilterBar config={PRODUCT_STATUS_FILTER} />
        <ProductsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};

export const ProductsFilterPopover = () => {
  const { t } = useTranslation('product');
  return (
    <>
      <Filter.Popover scope={ProductHotKeyScope.ProductsPage}>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
              />

              <Command.List className="p-1">
                <Filter.SearchValueTrigger />
                <SelectCategory.FilterItem
                  value="categoryIds"
                  label={t('category')}
                />
                <OptionFilterItem config={PRODUCT_TYPE_FILTER} />
                <SelectCompany.FilterItem
                  value="vendorId"
                  label={t('vendor')}
                />
                <SelectBrands.FilterItem value="brandIds" label={t('brands')} />
                <TagsFilter />
                <SegmentsFilter />
                <PropertiesFilter />
                <OptionFilterItem config={PRODUCT_STATUS_FILTER} />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectCategory.FilterView filterKey="categoryIds" mode="multiple" />
          <OptionFilterView config={PRODUCT_TYPE_FILTER} />
          <SelectCompany.FilterView mode="single" filterKey="vendorId" />
          <SelectBrands.FilterView mode="multiple" filterKey="brandIds" />
          <TagsFilter.View tagType="core:product" />
          <SegmentsFilter.View contentType="core:products.products" />
          <PropertiesFilter.View contentType="core:product" />
          <OptionFilterView config={PRODUCT_STATUS_FILTER} />
        </Combobox.Content>
      </Filter.Popover>
    </>
  );
};
