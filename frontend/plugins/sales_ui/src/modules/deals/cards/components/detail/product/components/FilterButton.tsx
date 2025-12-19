import { Button, Combobox, Command, Filter, Popover } from 'erxes-ui';
import {
  IconCategory,
  IconTag,
  IconBuilding,
  IconLabel,
  IconGitBranch,
  IconFolder,
  IconX,
} from '@tabler/icons-react';
import {
  SelectCategory,
  SelectBranches,
  SelectDepartments,
  SelectCompany,
  SelectTags,
  SelectBrand,
  IProduct,
} from 'ui-modules';
import { ProductFilterState } from '@/deals/actionBar/types/actionBarTypes';
import { useProductCategories } from 'ui-modules/modules/products/categories/hooks/useCategories';
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
        p.name?.toLowerCase().includes(search) ||
        p.code?.toLowerCase().includes(search),
    );
  }
  if (filters.productCategoryId) {
    result = result.filter((p) =>
      filters.productCategoryId?.includes(p.categoryId || ''),
    );
  }

  if (filters.productVendorId) {
    result = result.filter((p) =>
      filters.productVendorId?.includes((p as any).vendorId || ''),
    );
  }

  if (filters.productBrandId) {
    result = result.filter((p) =>
      filters.productBrandId?.includes((p as any).brandId || ''),
    );
  }

  if (filters.productTagIds) {
    result = result.filter((p) =>
      p.tagIds?.some((tag) => filters.productTagIds?.includes(tag)),
    );
  }

  if (filters.productBranchId) {
    result = result.filter((p) =>
      p.branchId?.includes(filters.productBranchId || ''),
    );
  }

  if (filters.productDepartmentId) {
    result = result.filter((p) =>
      p.departmentId?.includes(filters.productDepartmentId || ''),
    );
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
  const {
    productCategoryId,
    productTagIds,
    productVendorId,
    productBranchId,
    productDepartmentId,
    productBrandId,
  } = filters;

  const getCategoryName = (id: string) => {
    const category = categories.find((cat) => cat._id === id);
    return category?.name || id;
  };

  const updateFilter = (key: keyof ProductFilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <>
      {productCategoryId !== undefined && (
        <CustomFilterItem
          onClear={() => updateFilter('productCategoryId', undefined)}
        >
          <Filter.BarName>
            <IconCategory />
            Category
          </Filter.BarName>
          <Filter.BarButton>
            {productCategoryId?.[0] ? (
              <span className="">{getCategoryName(productCategoryId[0])}</span>
            ) : (
              'All'
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

        </CustomFilterItem>
      )}

      {productVendorId !== undefined && (
        <CustomFilterItem
          onClear={() => updateFilter('productVendorId', undefined)}
        >
          <Filter.BarName>
            <IconBuilding />
            Vendor
          </Filter.BarName>

        </CustomFilterItem>
      )}

      {productBrandId !== undefined && (
        <CustomFilterItem
          onClear={() => updateFilter('productBrandId', undefined)}
        >
          <Filter.BarName>
            <IconLabel />
            Brand
          </Filter.BarName>

        </CustomFilterItem>
      )}

      {productBranchId !== undefined && (
        <CustomFilterItem
          onClear={() => updateFilter('productBranchId', undefined)}
        >
          <Filter.BarName>
            <IconGitBranch />
            Branch
          </Filter.BarName>

        </CustomFilterItem>
      )}

      {productDepartmentId !== undefined && (
        <CustomFilterItem
          onClear={() => updateFilter('productDepartmentId', undefined)}
        >
          <Filter.BarName>
            <IconFolder />
            Department
          </Filter.BarName>

        </CustomFilterItem>
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

  return (
    <>
      <Filter.View>
        <Command>
          <Command.List className="p-1">
            <Filter.Item value="productCategoryIds">
              <IconCategory />
              Category
            </Filter.Item>
            <Filter.Item value="productBranchIds">
              <IconGitBranch />
              Branch
            </Filter.Item>
            <Filter.Item value="productDepartmentIds">
              <IconFolder />
              Department
            </Filter.Item>
            <Filter.Item value="productVendorIds">
              <IconBuilding />
              Vendor
            </Filter.Item>
            <Filter.Item value="productTagIds">
              <IconTag />
              Tag
            </Filter.Item>
            <Filter.Item value="productBrandIds">
              <IconLabel />
              Brand
            </Filter.Item>
          </Command.List>
        </Command>
      </Filter.View>

      <Filter.View filterKey="productCategoryIds">
        <SelectCategory
          selected={filters.productCategoryId?.[0]}
          onSelect={(id) => updateFilter('productCategoryId', [id])}
        />
      </Filter.View>

      <Filter.View filterKey="productBranchIds">
        <SelectBranches
          value={filters.productBranchId?.[0]}
          onValueChange={(value) => updateFilter('productBranchId', value)}
        />
      </Filter.View>

      <Filter.View filterKey="productDepartmentIds">
        <SelectDepartments
          value={filters.productDepartmentId?.[0]}
          onValueChange={(value) => updateFilter('productDepartmentId', value)}
        />
      </Filter.View>

      <Filter.View filterKey="productVendorIds">
        <SelectCompany
          value={filters.productVendorId?.[0]}
          onValueChange={(value) => updateFilter('productVendorId', value)}
        />
      </Filter.View>

      <Filter.View filterKey="productTagIds">
        <SelectTags
          tagType="product"
          value={filters.productTagIds?.[0]}
          onValueChange={(value) => updateFilter('productTagIds', value)}
        />
      </Filter.View>

      <Filter.View filterKey="productBrandIds">
        <SelectBrand
          value={filters.productBrandId?.[0]}
          onValueChange={(value) => updateFilter('productBrandId', value)}
        />
      </Filter.View>
    </>
  );
};
