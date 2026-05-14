import { Combobox, Command, Filter } from 'erxes-ui';
import {
  SelectBranches,
  SelectBrands,
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

import { PRODUCTS_CURSOR_SESSION_KEY } from '../constants/productsCursorSessionKey';
import { ProductHotKeyScope } from '../types/ProductsHotKeyScope';
import { ProductsTotalCount } from './ProductsTotalCount';
import {
  SelectProductCategoryFilterBar,
  SelectProductCategoryFilterItem,
  SelectProductCategoryFilterView,
} from '../products-filter/components/selects/SelectProductCategory';
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
  return (
    <Filter.Popover scope={ProductHotKeyScope.ProductsPage}>
      <Filter.Trigger />
      <Combobox.Content>
        <Filter.View>
          <Command>
            <Filter.CommandInput placeholder="Filter" variant="secondary" />
            <Command.List className="p-1">
              <Filter.SearchValueTrigger />
              <SelectProductCategoryFilterItem
                value="categoryIds"
                label="Category"
              />
              <SelectProductTypeFilterItem />
              <SelectBranches.FilterItem value="branchId" label="Branch" />
              <SelectDepartments.FilterItem
                value="departmentId"
                label="Department"
              />
              <SelectBrands.FilterItem value="brandIds" label="Brand" />
              <SelectCompany.FilterItem value="vendorId" label="Vendor" />
              <TagsFilter />
              <SelectProductSegmentFilterItem />
              <Filter.Item value="minRemainder" inDialog>
                <IconPackage size={14} />
                Remainder
              </Filter.Item>
              <Filter.Item value="minPrice" inDialog>
                <IconCurrencyDollar size={14} />
                Price
              </Filter.Item>
              <Filter.Item value="minDiscountValue" inDialog>
                <IconDiscount size={14} />
                Discount amount
              </Filter.Item>
              <Filter.Item value="minDiscountPercent" inDialog>
                <IconPercentage size={14} />
                Discount percent
              </Filter.Item>
            </Command.List>
          </Command>
        </Filter.View>
        <SelectProductCategoryFilterView filterKey="categoryIds" />
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
              label="Remainder"
            />
          </Filter.View>
          <Filter.View filterKey="minPrice" inDialog>
            <NumberRangeDialogView
              minKey="minPrice"
              maxKey="maxPrice"
              label="Price"
            />
          </Filter.View>
          <Filter.View filterKey="minDiscountValue" inDialog>
            <NumberRangeDialogView
              minKey="minDiscountValue"
              maxKey="maxDiscountValue"
              label="Discount amount"
            />
          </Filter.View>
          <Filter.View filterKey="minDiscountPercent" inDialog>
            <NumberRangeDialogView
              minKey="minDiscountPercent"
              maxKey="maxDiscountPercent"
              label="Discount percent"
            />
          </Filter.View>
        </Filter.Dialog>

        <Filter.SearchValueBarItem />
        <SelectProductCategoryFilterBar
          filterKey="categoryIds"
          label="Category"
        />
        <SelectProductTypeFilterBar />
        <SelectBranches.FilterBar
          mode="single"
          filterKey="branchId"
          label="Branch"
        />
        <SelectDepartments.FilterBar
          mode="single"
          filterKey="departmentId"
          label="Department"
        />
        <SelectBrands.FilterBar
          mode="multiple"
          filterKey="brandIds"
          label="Brand"
        />
        <SelectCompany.FilterBar
          mode="single"
          filterKey="vendorId"
          label="Vendor"
          cursorKey={PRODUCTS_CURSOR_SESSION_KEY}
        />
        <TagsFilter.Bar tagType={PRODUCT_TAG_TYPE} />
        <SelectProductSegmentFilterBar />
        <NumberRangeBarItem
          minKey="minRemainder"
          maxKey="maxRemainder"
          label="Remainder"
          icon={<IconPackage size={14} />}
        />
        <NumberRangeBarItem
          minKey="minPrice"
          maxKey="maxPrice"
          label="Price"
          icon={<IconCurrencyDollar size={14} />}
        />
        <NumberRangeBarItem
          minKey="minDiscountValue"
          maxKey="maxDiscountValue"
          label="Discount amount"
          icon={<IconDiscount size={14} />}
        />
        <NumberRangeBarItem
          minKey="minDiscountPercent"
          maxKey="maxDiscountPercent"
          label="Discount percent"
          icon={<IconPercentage size={14} />}
        />

        <ProductsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
