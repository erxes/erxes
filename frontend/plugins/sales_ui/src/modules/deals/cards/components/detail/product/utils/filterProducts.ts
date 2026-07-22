import type { ProductFilterState } from '@/deals/actionBar/types/actionBarTypes';
import type { IProduct } from 'ui-modules';

type FilterableProduct = IProduct & {
  vendor?: { _id: string } | null;
};

export const filterProducts = (
  products: FilterableProduct[],
  filters: ProductFilterState,
) => {
  let result = products;

  if (filters.productSearch) {
    const search = filters.productSearch.toLowerCase();
    result = result.filter((product) =>
      product.name?.toLowerCase().includes(search),
    );
  }

  if (filters.productCategoryIds) {
    result = result.filter((product) =>
      filters.productCategoryIds?.includes(product.categoryId || ''),
    );
  }

  if (filters.productTagIds) {
    result = result.filter((product) =>
      product.tagIds?.some((tag) => filters.productTagIds?.includes(tag)),
    );
  }

  if (filters.productVendorIds?.length) {
    result = result.filter((product) => {
      const vendorId = product.vendor?._id;

      return (
        !!vendorId && filters.productVendorIds?.includes(vendorId) === true
      );
    });
  }

  if (filters.branchIds?.length) {
    const hasBranchIds = result.some(
      (product) => typeof product.branchId === 'string',
    );

    if (hasBranchIds) {
      result = result.filter(
        (product) =>
          !!product.branchId &&
          filters.branchIds?.includes(product.branchId) === true,
      );
    }
  }

  if (filters.departmentIds?.length) {
    const hasDepartmentIds = result.some(
      (product) => typeof product.departmentId === 'string',
    );

    if (hasDepartmentIds) {
      result = result.filter(
        (product) =>
          !!product.departmentId &&
          filters.departmentIds?.includes(product.departmentId) === true,
      );
    }
  }

  return result;
};
