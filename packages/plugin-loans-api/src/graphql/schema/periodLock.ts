export const types = () => `
  type PeriodLock {
    _id: String!
    createdAt: Date
    createdBy: String 
    date: Date
    excludeContracts:[String]
    user: User
  }

  type PeriodLocksListResponse {
    list: [PeriodLock],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  searchValue: String
  startDate: Date
  endDate: Date
  sortField: String
  sortDirection: Int
`;

export const queries = `
  periodLocksMain(${queryParams}): PeriodLocksListResponse
  periodLocks(${queryParams}): [PeriodLock]
  periodLockDetail(_id: String!): PeriodLock
`;

const commonFields = `
  date: Date
  excludeContracts:[String]
`;

export const mutations = `
  periodLocksAdd(${commonFields}): PeriodLock
  periodLocksEdit(_id: String!, ${commonFields}): PeriodLock
  periodLocksRemove(periodLockIds: [String]): [String]
`;
