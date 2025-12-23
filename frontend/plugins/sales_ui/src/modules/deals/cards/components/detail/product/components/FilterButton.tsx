import { Button, Combobox, Command, Filter, Popover } from 'erxes-ui';
import {
  IconCategory,
  IconTag,
  IconBuilding,
  IconX,
} from '@tabler/icons-react';
import {
  SelectCategory,
  SelectCompany,
  SelectTags,
  IProduct,
} from 'ui-modules';
import { ProductFilterState } from '@/deals/actionBar/types/actionBarTypes';
import { useProductCategories } from 'ui-modules/modules/products/categories/hooks/useCategories';
import { useTags } from 'ui-modules/modules/tags/hooks/useTags';

interface Props {
  filters: ProductFilterState;
  onFilterChange: (filters: ProductFilterState) => void;
}

  

const CustomFilterItem = ({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) => (
  <div className="rounded flex gap-px h-fit items-stretch shadow-xs bg-muted text-sm font-medium">
    {children}
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onClear();
      }}
    >
      <IconX size={14} />
    </Button>
  </div>
);

export const FilterButton = ({ filters, onFilterChange }: Props) => {
  const hasFilters = Object.values(filters || {}).some(
    (value) =>
      value !== null &&
      value !== undefined &&
      (Array.isArray(value) ? value.length > 0 : value !== ''),
  );

  return (
    <Filter.Popover>
      <Filter.Trigger isFiltered={hasFilters} />
      <Combobox.Content align="end" sideOffset={8} side="bottom">
        <Popover.Close className="hidden" />
        <ProductFilterView filters={filters} onChange={onFilterChange} />
      </Combobox.Content>
    </Filter.Popover>
  );
};

export const filterProducts = (
  products: IProduct[],
  filters: ProductFilterState,
) => {
  let result = products;

  if (filters.productSearch) {
    const search = filters.productSearch.toLowerCase();
    result = result.filter(
      (p) =>
        p.name?.toLowerCase().includes(search)
    );
  }
  if (filters.productCategoryIds) {
    result = result.filter((p) =>
      filters.productCategoryIds?.includes(p.categoryId || ''),
    );
  }
  
  if (filters.productTagIds) {
    result = result.filter((p) =>
      p.tagIds?.some((tag) => filters.productTagIds?.includes(tag))
    );
  }
  
  // if (filters.productVendorIds?.length) {
  //   result = result.filter((p) =>
  //     p.vendorId && filters.productVendorIds?.includes(p.vendorId)
  //   );
  // }

  return result;
};

export const ProductFilterBar = ({
  filters,
  onChange,
}: {
  filters: ProductFilterState;
  onChange: (f: ProductFilterState) => void;
}) => {
  const { productCategories: categories = [] } = useProductCategories();
  const { tags = [] } = useTags({ variables: { ids: [] } });
  const {
    productCategoryIds,
    productTagIds,
    productVendorIds,
  } = filters;

  const getCategoryName = (id: string) => {
    const category = categories.find((cat) => cat._id === id);
    return category?.name || id;
  };

    const getTagNames = (tagIds: string[]): string => {
    const tagNames = tagIds
      .map((id) => tags?.find((t) => t._id === id)?.name)
    return tagNames.length > 0 ? tagNames.join(', ') : 'None';
  };

  const updateFilter = (key: keyof ProductFilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <>
      {productCategoryIds !== undefined && (
        <CustomFilterItem
          onClear={() => updateFilter('productCategoryIds', undefined)}
        >
          <Filter.BarName>
            <IconCategory />
            Category
          </Filter.BarName>
          <Filter.BarButton>
            {productCategoryIds && (
              <span className="">{getCategoryName(productCategoryIds[0])}</span>
            )}
          </Filter.BarButton>
        </CustomFilterItem>
      )}

      {productTagIds !== undefined && (
        <CustomFilterItem
          onClear={() => updateFilter('productTagIds', undefined)}
        >
          <Filter.BarName>
            <IconTag />
            Tags
          </Filter.BarName>
          <Filter.BarButton>
            {productTagIds && productTagIds.length > 0 && (
              <span className="">{getTagNames(productTagIds)}</span>
            )}
          </Filter.BarButton>
        </CustomFilterItem>
      )}
{/* 
      {productVendorIds !== undefined && (
        <CustomFilterItem
          onClear={() => updateFilter('productVendorIds', undefined)}
        >
          <Filter.BarName>
            <IconBuilding />
            Vendor
          </Filter.BarName>
          <Filter.BarButton>
            {productVendorIds?.[0] && (
              <span className="">{getVendorName(productVendorIds[0])}</span>
            )}
          </Filter.BarButton>
        </CustomFilterItem>
      )} */}
    </>
  );
};

const ProductFilterView = ({
  filters,
  onChange,
}: {
  filters: ProductFilterState;
  onChange: (f: ProductFilterState) => void;
}) => {
  const updateFilter = (key: keyof ProductFilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <>
      <Filter.View>
        <Command>
          <Command.List className="p-1">
            <Filter.Item value="productCategoryIds">
              <IconCategory />
              By Category
            </Filter.Item>
            <SelectCompany.FilterItem value="productVendorIds" label="By Vendor" />
            <Filter.Item value="productTagIds">
              <IconTag />
              By Tag
            </Filter.Item>
          </Command.List>
        </Command>
      </Filter.View>

      <Filter.View filterKey='productCategoryIds'>
        <SelectCategory
          value={filters.productCategoryIds?.[0]}
          onSelect={(value) => updateFilter('productCategoryIds', value ? [value] : undefined)}
        />
      </Filter.View>

      <SelectCompany.FilterView
        mode="multiple"
        filterKey="productVendorIds"
        />

      <Filter.View filterKey="productTagIds">
        <SelectTags
          tagType="product"
          value={filters.productTagIds?.[0]}
          onValueChange={(value) => updateFilter('productTagIds', value ? [value] : undefined)}
        />
      </Filter.View>
    </>
  );
};
