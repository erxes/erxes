import { gql } from '~/gql';

export const RESERVE_REMS_QUERY = gql(`
query accountingReserveRems($searchValue: String, $branchId: String, $departmentId: String, $productId: String, $productCategoryId: String, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
  reserveRems(
    searchValue: $searchValue
    branchId: $branchId
    departmentId: $departmentId
    productId: $productId
    productCategoryId: $productCategoryId
    page: $page
    perPage: $perPage
    sortField: $sortField
    sortDirection: $sortDirection
  ) {
    _id
    branchId
    departmentId
    productId
    uom
    remainder
    createdAt
    modifiedAt
    product {
      _id
      code
      name
    }
    branch {
      _id
      code
      title
    }
    department {
      _id
      code
      title
    }
    modifiedUser {
      _id
      details {
        avatar
        fullName
      }
    }
  }
  reserveRemsCount(
    searchValue: $searchValue
    branchId: $branchId
    departmentId: $departmentId
    productId: $productId
    productCategoryId: $productCategoryId
  )
}
`);
