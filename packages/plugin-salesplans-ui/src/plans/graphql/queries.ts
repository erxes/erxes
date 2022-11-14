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

const commonPlanFields = `
  _id,
  departmentId
  branchId
  productId
  uomId
  values
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
    uomId
    subUoms
  }
  uom {
    _id
    code
    name
  }
  createdUser {
    ${userFields}
  }
  modifiedUser {
    ${userFields}
  }
`;

export const yearPlanFields = `
  ${commonPlanFields}
  year
  confirmedData
`;

export const dayPlanFields = `
  ${commonPlanFields}
  date
  status
`;

export const filterDefs = `
  $_ids:[String],
  $searchValue: String,
  $filterStatus: String,
  $departmentId: String,
  $branchId: String,
  $productId: String,
  $productCategoryId: String,
  $minValue: Float,
  $maxValue: Float,
  $dateType: String,
  $startDate: Date,
  $endDate: Date,
`;

export const filterValues = `
  _ids: $_ids,
  searchValue: $searchValue,
  filterStatus: $filterStatus,
  departmentId: $departmentId,
  branchId: $branchId,
  productId: $productId,
  productCategoryId: $productCategoryId,
  minValue: $minValue,
  maxValue: $maxValue,
  dateType: $dateType,
  startDate: $startDate,
  endDate: $endDate,
`;

const yearPlans = `
  query yearPlans($year: Int, ${filterDefs} ${paginateDefs} ) {
    yearPlans(year: $year, ${filterValues} ${paginateValues}) {
      ${yearPlanFields}
    }
  }
`;

const dayPlans = `
  query dayPlans($date: Int, ${filterDefs} ) {
    dayPlans(date: $date, ${filterValues}) {
      _id,
      labelIds,
      month
    }
  }
`;

const yearPlansCount = `
  query yearPlansCount($year: Int, ${filterDefs} ) {
    yearPlansCount(year: $year, ${filterValues})
  }
`;

const dayPlansCount = `
  query dayPlansCount($date: Int, ${filterDefs} ) {
    dayPlansCount(date: $date, ${filterValues})
  }
`;

export default {
  yearPlans,
  dayPlans,
  yearPlansCount,
  dayPlansCount
};
