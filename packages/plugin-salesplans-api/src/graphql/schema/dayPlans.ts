export const types = () => `
  type PlanTimeValues {
    _id: String,
    timeId: String,
    count: Float
  }

  type DayPlan @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    date: Date,
    planCount: Float,
    status: String,
    departmentId: String,
    branchId: String,
    productId: String,
    uom: String,
    values: [PlanTimeValues],
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
  dayPlans(date: Date, ${planFilterParams}, ${paginateParams}): [DayPlan],
  dayPlansCount(date: Date, ${planFilterParams}, ${paginateParams}): Int,
  dayPlansSum(date: Date, ${planFilterParams}, ${paginateParams}): JSON,
`;

export const planCreateParams = `
  date: Date,
  departmentId: String,
  branchId: String,
  productCategoryId: String,
  productId: String,
`;

export const mutations = `
  dayPlansAdd(${planCreateParams}): [DayPlan]
  dayPlansRemove(_ids: [String]): JSON
  dayPlanEdit(_id: String!, uom: String, values: JSON): DayPlan
  dayPlansConfirm(
    date: Date,
    branchId: String,
    departmentId: String,
    productCategoryId: String,
    productId: String,
    ids: [String]
  ): JSON
`;
