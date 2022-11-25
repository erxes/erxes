export const spLabelFields = `
  _id
  title,
  description,
  effect,
  status,
  color,
  rules
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

export const filterDefs = `
  $_ids:[String],
  $searchValue: String,
  $filterStatus: String,
  $minMultiplier: Float
  $maxMultiplier: Float
`;

export const filterValues = `
  _ids: $_ids,
  searchValue: $searchValue,
  filterStatus: $filterStatus,
  minMultiplier: $minMultiplier,
  maxMultiplier: $maxMultiplier,
`;

const spLabels = `
  query spLabels(${filterDefs} ${paginateDefs}) {
    spLabels(${filterValues} ${paginateValues}) {
      ${spLabelFields}
    }
  }
`;

const spLabelsCount = `
  query spLabelsCount(${filterDefs}) {
    spLabelsCount(${filterValues})
  }
`;

const timeframes = `
  query timeframes {
    timeframes {
      _id,
      name,
      description,
      percent,
      startTime,
      endTime
    }
  }
`;

export const timeProportionFields = `
  _id
  departmentId
  branchId
  productCategoryId
  percents {
    _id
    timeId
    percent
  }

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
  productCategory {
    _id
    code
    name
    parentId
    order
  }
`;

export const timeFilterDefs = `
  $departmentId: String,
  $branchId: String,
  $productCategoryId: String,
`;

export const timeFilterValues = `
  departmentId: $departmentId,
  branchId: $branchId,
  productCategoryId: $productCategoryId,
`;

const timeProportions = `
  query timeProportions(${timeFilterDefs} ${paginateDefs}) {
    timeProportions(${timeFilterValues} ${paginateValues}) {
      ${timeProportionFields}
    }
  }
`;

const timeProportionsCount = `
  query timeProportionsCount(${timeFilterDefs}) {
    timeProportionsCount(${timeFilterValues})
  }
`;

export default {
  spLabels,
  spLabelsCount,
  timeframes,
  timeProportions,
  timeProportionsCount
};
