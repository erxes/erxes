export const types = () => `
  type YearPlan @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    year: Int,
    confirmedData: JSON,
    departmentId: String,
    branchId: String,
    productId: String,
    uom: String,
    values: JSON
    createdAt: Date,
    createdBy: String,
    modifiedAt: Date,
    modifiedBy: String,

    department: Department,
    branch: Branch,
    product: Product,
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
  searchValue: String,
  filterStatus: String,
  departmentId: String,
  branchId: String,
  productId: String,
  productCategoryId: String,
  minValue: Float,
  maxValue: Float,
  dateType: String,
  startDate: Date,
  endDate: Date,
`;

export const queries = `
  yearPlans(year: Int, ${planFilterParams}, ${paginateParams}): [YearPlan],
  yearPlansCount(year: Int, ${planFilterParams}, ${paginateParams}): Int,
  yearPlansSum(year: Int, ${planFilterParams}, ${paginateParams}): JSON,
`;

export const planCreateParams = `
  year: Int,
  departmentId: String,
  branchId: String,
  productCategoryId: String,
  productId: String,
`;

export const mutations = `
  yearPlansAdd(${planCreateParams}): [YearPlan]
  yearPlansRemove(_ids: [String]): JSON
  yearPlanEdit(_id: String!, uom: String, values: JSON): YearPlan
`;
