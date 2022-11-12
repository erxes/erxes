export const spLabelFields = `
  _id
  title,
  description,
  effect,
  status,
  color,
  multiplier
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
      startTime,
      endTime
    }
  }
`;

export default {
  spLabels,
  spLabelsCount,
  timeframes
};
