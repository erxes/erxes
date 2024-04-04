export const types = () => `
  type SavingPeriodLock {
    _id: String!
    createdAt: Date
    createdBy: String 
    date: Date
    excludeContracts:[String]
    generals: JSON
  }

  type SavingPeriodLocksListResponse {
    list: [SavingPeriodLock],
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
  savingsPeriodLocksMain(${queryParams}): SavingPeriodLocksListResponse
  savingsPeriodLocks(${queryParams}): [SavingPeriodLock]
  savingsPeriodLockDetail(_id: String!): SavingPeriodLock
`;

const commonFields = `
  date: Date
  excludeContracts:[String]
`;

export const mutations = `
  savingsPeriodLocksAdd(${commonFields}): SavingPeriodLock
  savingsPeriodLocksEdit(_id: String!, ${commonFields}): SavingPeriodLock
  savingsPeriodLocksRemove(periodLockIds: [String]): [String]
`;
