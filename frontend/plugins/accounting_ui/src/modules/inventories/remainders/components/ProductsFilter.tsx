import { Combobox, Command, Filter } from 'erxes-ui';
import {
  SelectBranches,
  SelectBrands,
  SelectCategory,
  SelectCompany,
  SelectDepartments,
  TagsFilter,
} from 'ui-modules';
import {
  IconCurrencyDollar,
  IconDiscount,
  IconPackage,
  IconPercentage,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { PRODUCTS_CURSOR_SESSION_KEY } from '../constants/productsCursorSessionKey';
import { ProductHotKeyScope } from '../types/ProductsHotKeyScope';
import { ProductsTotalCount } from './ProductsTotalCount';
import {
  SelectProductSegmentFilterBar,
  SelectProductSegmentFilterItem,
  SelectProductSegmentFilterView,
} from '../products-filter/components/selects/SelectProductSegment';
import {
  SelectProductTypeFilterBar,
  SelectProductTypeFilterItem,
  SelectProductTypeFilterView,
} from '../products-filter/components/selects/SelectProductType';
import {
  NumberRangeBarItem,
  NumberRangeDialogView,
} from '../products-filter/components/selects/NumberRangeFilter';

const PRODUCT_TAG_TYPE = 'core:product';

export const ProductsFilterPopover = () => {
  const { t } = useTranslation('accounting');
  return (
    <Filter.Popover scope={ProductHotKeyScope.ProductsPage}>
      <Filter.Trigger />
      <Combobox.Content>
        <Filter.View>
          <Command>
            <Filter.CommandInput placeholder={t('filter')} variant="secondary" />
            <Command.List className="p-1">
              <Filter.SearchValueTrigger />
              <SelectCategory.FilterItem value="categoryIds" label={t('category')} />
              <SelectProductTypeFilterItem />
              <SelectBranches.FilterItem value="branchId" label={t('branch')} />
              <SelectDepartments.FilterItem
                value="departmentId"
                label={t('department')}
              />
              <SelectBrands.FilterItem value="brandIds" label={t('brand')} />
              <SelectCompany.FilterItem value="vendorId" label={t('vendor')} />
              <TagsFilter />
              <SelectProductSegmentFilterItem />
              <Filter.Item value="minRemainder" inDialog>
                <IconPackage size={14} />
                {t('remainder')}
              </Filter.Item>
              <Filter.Item value="minPrice" inDialog>
                <IconCurrencyDollar size={14} />
                {t('price')}
              </Filter.Item>
              <Filter.Item value="minDiscountValue" inDialog>
                <IconDiscount size={14} />
                {t('discount-amount')}
              </Filter.Item>
              <Filter.Item value="minDiscountPercent" inDialog>
                <IconPercentage size={14} />
                {t('discount-percent')}
              </Filter.Item>
            </Command.List>
          </Command>
        </Filter.View>
        <SelectCategory.FilterView filterKey="categoryIds" mode="multiple" />
        <SelectProductTypeFilterView />
        <SelectBranches.FilterView mode="single" filterKey="branchId" />
        <SelectDepartments.FilterView mode="single" filterKey="departmentId" />
        <SelectBrands.FilterView mode="multiple" filterKey="brandIds" />
        <SelectCompany.FilterView mode="single" filterKey="vendorId" />
        <TagsFilter.View tagType={PRODUCT_TAG_TYPE} />
        <SelectProductSegmentFilterView />
      </Combobox.Content>
    </Filter.Popover>
  );
};

export const ProductsFilter = () => {
  const { t } = useTranslation('accounting');
  return (
    <Filter id="products-filter" sessionKey={PRODUCTS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <ProductsFilterPopover />
        <Filter.Dialog>
          <Filter.View filterKey="searchValue" inDialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.View>
          <Filter.View filterKey="minRemainder" inDialog>
            <NumberRangeDialogView
              minKey="minRemainder"
              maxKey="maxRemainder"
              label={t('remainder')}
            />
          </Filter.View>
          <Filter.View filterKey="minPrice" inDialog>
            <NumberRangeDialogView
              minKey="minPrice"
              maxKey="maxPrice"
              label={t('price')}
            />
          </Filter.View>
          <Filter.View filterKey="minDiscountValue" inDialog>
            <NumberRangeDialogView
              minKey="minDiscountValue"
              maxKey="maxDiscountValue"
              label={t('discount-amount')}
            />
          </Filter.View>
          <Filter.View filterKey="minDiscountPercent" inDialog>
            <NumberRangeDialogView
              minKey="minDiscountPercent"
              maxKey="maxDiscountPercent"
              label={t('discount-percent')}
            />
          </Filter.View>
        </Filter.Dialog>

        <Filter.SearchValueBarItem />
        <SelectCategory.FilterBar
          filterKey="categoryIds"
          label={t('category')}
          mode="multiple"
        />
        <SelectProductTypeFilterBar />
        <SelectBranches.FilterBar
          mode="single"
          filterKey="branchId"
          label={t('branch')}
        />
        <SelectDepartments.FilterBar
          mode="single"
          filterKey="departmentId"
          label={t('department')}
        />
        <SelectBrands.FilterBar
          mode="multiple"
          filterKey="brandIds"
          label={t('brand')}
        />
        <SelectCompany.FilterBar
          mode="single"
          filterKey="vendorId"
          label={t('vendor')}
          cursorKey={PRODUCTS_CURSOR_SESSION_KEY}
        />
        <TagsFilter.Bar tagType={PRODUCT_TAG_TYPE} />
        <SelectProductSegmentFilterBar />
        <NumberRangeBarItem
          minKey="minRemainder"
          maxKey="maxRemainder"
          label={t('remainder')}
          icon={<IconPackage size={14} />}
        />
        <NumberRangeBarItem
          minKey="minPrice"
          maxKey="maxPrice"
          label={t('price')}
          icon={<IconCurrencyDollar size={14} />}
        />
        <NumberRangeBarItem
          minKey="minDiscountValue"
          maxKey="maxDiscountValue"
          label={t('discount-amount')}
          icon={<IconDiscount size={14} />}
        />
        <NumberRangeBarItem
          minKey="minDiscountPercent"
          maxKey="maxDiscountPercent"
          label={t('discount-percent')}
          icon={<IconPercentage size={14} />}
        />

        <ProductsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
