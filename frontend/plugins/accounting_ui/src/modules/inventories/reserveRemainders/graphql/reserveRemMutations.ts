import { gql } from '~/gql';

export const RESERVE_REMS_ADD = gql(`
mutation accountingReserveRemsAdd($departmentIds: [String], $branchIds: [String], $productCategoryId: String, $productId: String, $remainder: Float) {
  reserveRemsAdd(
    departmentIds: $departmentIds
    branchIds: $branchIds
    productCategoryId: $productCategoryId
    productId: $productId
    remainder: $remainder
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
}
`);

export const RESERVE_REM_EDIT = gql(`
mutation accountingReserveRemEdit($_id: String!, $branchId: String, $departmentId: String, $productId: String, $uom: String, $remainder: Float) {
  reserveRemEdit(
    _id: $_id
    branchId: $branchId
    departmentId: $departmentId
    productId: $productId
    uom: $uom
    remainder: $remainder
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
}
`);

export const RESERVE_REMS_REMOVE = gql(`
mutation accountingReserveRemsRemove($_ids: [String!]!) {
  reserveRemsRemove(_ids: $_ids)
}
`);
