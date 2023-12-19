const userFields = `
  _id
  email
  username
  details {
    fullName
    shortName
  }
`;

export const paginateDefs = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int,
`;

export const paginateValues = `
  page: $page,
  perPage: $perPage,
  sortField: $sortField,
  sortDirection: $sortDirection,
`;

export const reserveRemFields = `
  _id
  departmentId
  branchId
  productId
  uom
  remainder
  createdAt
  createdBy
  modifiedAt
  modifiedBy

  department {
    _id
    code
    title
    parentId
  }
  branch {
    _id
    code
    title,
    parentId
  }
  product {
    _id
    code
    name
    categoryId
    uom
    subUoms
  }
  createdUser {
    ${userFields}
  }
  modifiedUser {
    ${userFields}
  }
`;

export const filterDefs = `
  $_ids:[String],
  $searchValue: String,
  $departmentId: String,
  $branchId: String,
  $productId: String,
  $productCategoryId: String,
  $remainder: Float,
  $dateType: String,
  $startDate: Date,
  $endDate: Date,
`;

export const filterValues = `
  _ids: $_ids,
  searchValue: $searchValue,
  departmentId: $departmentId,
  branchId: $branchId,
  productId: $productId,
  productCategoryId: $productCategoryId,
  remainder: $remainder,
  dateType: $dateType,
  startDate: $startDate,
  endDate: $endDate,
`;

const reserveRems = `
  query reserveRems(${filterDefs} ${paginateDefs} ) {
    reserveRems(${filterValues} ${paginateValues}) {
      ${reserveRemFields}
    }
  }
`;

const reserveRemsCount = `
  query reserveRemsCount(${filterDefs}) {
    reserveRemsCount(${filterValues})
  }
`;

export default {
  reserveRems,
  reserveRemsCount
};
