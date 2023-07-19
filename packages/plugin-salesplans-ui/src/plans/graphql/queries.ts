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
  uom
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

export const yearPlanFields = `
  ${commonPlanFields}
  year
  values
  confirmedData
`;

export const dayPlanFields = `
  ${commonPlanFields}
  planCount
  date
  values {
    _id
    timeId
    count
  }
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
  query yearPlans($year: Int, ${filterDefs} ${paginateDefs}) {
    yearPlans(year: $year, ${filterValues} ${paginateValues}) {
      ${yearPlanFields}
    }
  }
`;

const yearPlansCount = `
  query yearPlansCount($year: Int, ${filterDefs}) {
    yearPlansCount(year: $year, ${filterValues})
  }
`;

const yearPlansSum = `
  query yearPlansSum($year: Int, ${filterDefs}) {
    yearPlansSum(year: $year, ${filterValues})
  }
`;

const dayPlans = `
  query dayPlans($date: Date, ${filterDefs} ${paginateDefs}) {
    dayPlans(date: $date, ${filterValues} ${paginateValues}) {
      ${dayPlanFields}
    }
  }
`;

const dayPlansCount = `
  query dayPlansCount($date: Date, ${filterDefs}) {
    dayPlansCount(date: $date, ${filterValues})
  }
`;

const dayPlansSum = `
  query dayPlansSum($date: Date, ${filterDefs}) {
    dayPlansSum(date: $date, ${filterValues})
  }
`;

export default {
  yearPlans,
  yearPlansCount,
  yearPlansSum,
  dayPlans,
  dayPlansCount,
  dayPlansSum
};
