import { gql } from '@apollo/client';

export const reserveRemFields = `
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
`;

const reserveRemFilterParamDefs = `
  $searchValue: String
  $branchId: String
  $departmentId: String
  $productId: String
  $productCategoryId: String
`;

const reserveRemFilterParams = `
  searchValue: $searchValue
  branchId: $branchId
  departmentId: $departmentId
  productId: $productId
  productCategoryId: $productCategoryId
`;

const commonParamDefs = `
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
`;

const commonParams = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const RESERVE_REMS_QUERY = gql`
  query ReserveRems(${reserveRemFilterParamDefs}, ${commonParamDefs}) {
    reserveRems(${reserveRemFilterParams}, ${commonParams}) {
      ${reserveRemFields}
    }
    reserveRemsCount(${reserveRemFilterParams})
  }
`;
