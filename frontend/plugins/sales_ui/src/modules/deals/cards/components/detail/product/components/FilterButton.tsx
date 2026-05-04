import { useMemo } from 'react';
import { Button, Combobox, Command, Filter, Popover } from 'erxes-ui';
import {
  IProduct,
  SelectBranches,
  SelectCategory,
  SelectCompany,
  SelectDepartments,
  SelectTags,
} from 'ui-modules';
import { IconCategory, IconTag, IconX } from '@tabler/icons-react';

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
    result = result.filter((p) => p.name?.toLowerCase().includes(search));
  }
  if (filters.productCategoryIds) {
    result = result.filter((p) =>
      filters.productCategoryIds?.includes(p.categoryId || ''),
    );
  }

  if (filters.productTagIds) {
    result = result.filter((p) =>
      p.tagIds?.some((tag) => filters.productTagIds?.includes(tag)),
    );
  }

  if (filters.productVendorIds?.length) {
    result = result.filter((p) => {
      const vendor = (p as any).vendor as { _id: string } | undefined;
      return vendor !== undefined && filters.productVendorIds?.includes(vendor._id) === true;
    });
  }

  if (filters.branchIds?.length) {
    const hasBranchIds = result.some((p) => typeof p.branchId === 'string');
    if (hasBranchIds) {
      result = result.filter(
        (p) => !!p.branchId && filters.branchIds?.includes(p.branchId) === true,
      );
    }
  }

  if (filters.departmentIds?.length) {
    const hasDepartmentIds = result.some(
      (p) => typeof p.departmentId === 'string',
    );
    if (hasDepartmentIds) {
      result = result.filter(
        (p) =>
          !!p.departmentId && filters.departmentIds?.includes(p.departmentId) === true,
      );
    }
  }

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
    branchIds,
    departmentIds,
  } = filters;

  const getCategoryName = (id: string) => {
    const category = categories.find((cat) => cat._id === id);
    return category?.name || id;
  };

  const getTagNames = (tagIds: string[]): string => {
    const tagNames = tagIds.map((id) => tags?.find((t) => t._id === id)?.name);
    return tagNames.length > 0 ? tagNames.join(', ') : 'None';
  };

  const updateFilter = (key: keyof ProductFilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <>
      {productCategoryIds && (
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

      {productTagIds && (
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

      {productVendorIds && (
        <SelectCompany.Provider
          mode="multiple"
          value={productVendorIds}
          onValueChange={(value) =>
            updateFilter(
              'productVendorIds',
              value && (value as string[]).length ? value : undefined,
            )
          }
        >
          <CustomFilterItem
            onClear={() => updateFilter('productVendorIds', undefined)}
          >
            <Filter.BarName>Vendor</Filter.BarName>
            <Filter.BarButton>
              <SelectCompany.Value />
            </Filter.BarButton>
          </CustomFilterItem>
        </SelectCompany.Provider>
      )}

      {branchIds && branchIds.length > 0 && (
        <SelectBranches
          mode="multiple"
          value={branchIds}
          onValueChange={(value) =>
            updateFilter(
              'branchIds',
              value && (value as string[]).length ? value : undefined,
            )
          }
        >
          <CustomFilterItem
            onClear={() => updateFilter('branchIds', undefined)}
          >
            <Filter.BarName>Branch</Filter.BarName>
            <Filter.BarButton>
              <SelectBranches.Value />
            </Filter.BarButton>
          </CustomFilterItem>
        </SelectBranches>
      )}

      {departmentIds && departmentIds.length > 0 && (
        <SelectDepartments
          mode="multiple"
          value={departmentIds}
          onValueChange={(value) =>
            updateFilter(
              'departmentIds',
              value && (value as string[]).length ? value : undefined,
            )
          }
        >
          <CustomFilterItem
            onClear={() => updateFilter('departmentIds', undefined)}
          >
            <Filter.BarName>Department</Filter.BarName>
            <Filter.BarButton>
              <SelectDepartments.Value />
            </Filter.BarButton>
          </CustomFilterItem>
        </SelectDepartments>
      )}
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

  const vendorIds = useMemo(
    () => filters.productVendorIds ?? [],
    [filters.productVendorIds],
  );

  return (
    <>
      <Filter.View>
        <Command>
          <Command.List className="p-1">
            <Filter.Item value="productCategoryIds">
              <IconCategory />
              By Category
            </Filter.Item>
            <SelectCompany.FilterItem
              value="productVendorIds"
              label="By Vendor"
            />
            <Filter.Item value="productTagIds">
              <IconTag />
              By Tag
            </Filter.Item>
            <SelectBranches.FilterItem value="branchIds" label="By Branch" />
            <SelectDepartments.FilterItem
              value="departmentIds"
              label="By Department"
            />
          </Command.List>
        </Command>
      </Filter.View>

      <Filter.View filterKey="productCategoryIds">
        <SelectCategory
          selected={filters.productCategoryIds?.[0]}
          onSelect={(value) =>
            updateFilter('productCategoryIds', value ? [value] : undefined)
          }
        />
      </Filter.View>

      <Filter.View filterKey="productVendorIds">
        <SelectCompany.Provider
          mode="multiple"
          value={vendorIds}
          onValueChange={(value) => {
            updateFilter(
              'productVendorIds',
              value && (value as string[]).length ? value : undefined,
            );
          }}
        >
          <SelectCompany.Content />
        </SelectCompany.Provider>
      </Filter.View>

      <Filter.View filterKey="productTagIds">
        <SelectTags
          tagType="product"
          value={filters.productTagIds?.[0]}
          onValueChange={(value) =>
            updateFilter('productTagIds', value ? [value] : undefined)
          }
        />
      </Filter.View>

      <Filter.View filterKey="branchIds">
        <SelectBranches
          mode="multiple"
          value={filters.branchIds || []}
          onValueChange={(value) => {
            updateFilter(
              'branchIds',
              value && (value as string[]).length ? value : undefined,
            );
          }}
        >
          <SelectBranches.Content />
        </SelectBranches>
      </Filter.View>

      <Filter.View filterKey="departmentIds">
        <SelectDepartments
          mode="multiple"
          value={filters.departmentIds || []}
          onValueChange={(value) => {
            updateFilter(
              'departmentIds',
              value && (value as string[]).length ? value : undefined,
            );
          }}
        >
          <SelectDepartments.Content />
        </SelectDepartments>
      </Filter.View>
    </>
  );
};
