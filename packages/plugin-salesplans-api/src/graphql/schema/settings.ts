export const types = `
  type SPLabel {
    _id: String
    title: String
    description: String
    effect: String
    status: String
    color: String
    rules: JSON
  },

  input LabelRuleInput {
    id: String,
    productCategoryId: String
    multiplier: Float
  }

  type Timeframe {
    _id: String
    name: String
    description: String
    percent: Float
    startTime: Int
    endTime: Int
  }
`;

export const paginateParams = `
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
`;
export const filterParams = `
  _ids:[String],
  searchValue: String,
  filterStatus: String,
  productCateogryId: String,
  minMultiplier: Float,
  maxMultiplier: Float
`;

export const queries = `
  spLabels(${filterParams}, ${paginateParams}): [SPLabel],
  spLabelsCount(${filterParams}): Int,
  timeframes: [Timeframe]
`;

const params = `
  title: String,
  description: String,
  effect: String,
  status: String,
  color: String,
  rules: [LabelRuleInput]
`;

export const mutations = `
  timeframesEdit(docs: [JSON]): [Timeframe]
  spLabelsAdd(${params}): SPLabel
  spLabelsEdit(_id: String!, ${params}): SPLabel
  spLabelsRemove(_ids: [String]): JSON
`;
