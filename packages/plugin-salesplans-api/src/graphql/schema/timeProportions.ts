export const types = () => `
  type PercentValue {
    _id: String,
    timeId: String,
    percent: Float
  }

  type TimeProportion @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    departmentId: String,
    branchId: String,
    productCategoryId: String,
    percents: [PercentValue],
    createdAt: Date,
    createdBy: String,
    modifiedAt: Date,
    modifiedBy: String,

    department: Department,
    branch: Branch,
    productCategory: ProductCategory,
    createdUser: User,
    modifiedUser: User
  }
`;

export const paginateParams = `
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
`;

export const planFilterParams = `
  _ids:[String],
  departmentId: String,
  branchId: String,
  productCategoryId: String,
`;

export const queries = `
  timeProportions(${planFilterParams}, ${paginateParams}): [TimeProportion],
  timeProportionsCount(${planFilterParams}, ${paginateParams}): Int,
`;

export const planCreateParams = `
  departmentIds: [String],
  branchIds: [String],
  productCategoryId: String,
  percents: JSON
`;

export const mutations = `
  timeProportionsAdd(${planCreateParams}): [TimeProportion]
  timeProportionsRemove(_ids: [String]): JSON
  timeProportionEdit(_id: String!, percents: JSON): TimeProportion
`;
