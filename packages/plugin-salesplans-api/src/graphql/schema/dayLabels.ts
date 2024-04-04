export const types = () => `
  type DayLabel @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    date: Date,
    departmentId: String,
    branchId: String,
    labelIds: [String]
    createdAt: Date,
    createdBy: String,
    modifiedAt: Date,
    modifiedBy: String,

    department: Department,
    branch: Branch,
    labels: [SPLabel]
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
  date: Date,
  filterStatus: String,
  departmentId: String,
  branchId: String,
  labelId: String,
  dateType: String,
  startDate: Date,
  endDate: Date,
`;

export const queries = `
  dayLabels(${planFilterParams}, ${paginateParams}): [DayLabel],
  dayLabelsCount(${planFilterParams}, ${paginateParams}): Int,
`;

export const planCreateParams = `
  dates: [String],
  departmentIds: [String],
  branchIds: [String],
  labelIds: [String]
`;

export const mutations = `
  dayLabelsAdd(${planCreateParams}): [DayLabel]
  dayLabelsRemove(_ids: [String]): JSON
  dayLabelEdit(_id: String!, labelIds: [String]): DayLabel
`;
