import { Combobox, Command, Filter, useQueryState } from 'erxes-ui';
import { SelectCategory, SelectProduct } from 'ui-modules';
import { ProductRuleTotalCount } from './ProductRuleTotalCount';

function CategoriesFilterBar() {
  const [categoryIds] = useQueryState<string[]>('categoryIds');

  if (!categoryIds?.length) {
    return null;
  }

  return (
    <SelectCategory.FilterBar
      mode="multiple"
      filterKey="categoryIds"
      label="Category"
    />
  );
}

function ProductsFilterBar() {
  const [productIds] = useQueryState<string[]>('productIds');

  if (!productIds?.length) {
    return null;
  }

  return (
    <SelectProduct.FilterBar
      mode="multiple"
      filterKey="productIds"
      label="Product"
    />
  );
}

export const ProductRuleFilter = () => {
  return (
    <Filter id="product-rule-filter">
      <Filter.Bar>
        <Filter.Popover>
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
                  <SelectProduct.FilterItem
                    value="productIds"
                    label="Product"
                  />
                </Command.List>
              </Command>
            </Filter.View>
            <SelectCategory.FilterView
              filterKey="categoryIds"
              mode="multiple"
            />
            <SelectProduct.FilterView filterKey="productIds" mode="multiple" />
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.View filterKey="searchValue" inDialog>
            <Filter.DialogStringView filterKey="searchValue" label="Name" />
          </Filter.View>
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        <CategoriesFilterBar />
        <ProductsFilterBar />
        <ProductRuleTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
