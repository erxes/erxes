const periodLockFields = `
  _id
  createdBy
  createdAt
  date
  excludeContracts
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $searchValue: String
  $startDate: Date
  $endDate: Date
  $sortField: String
  $sortDirection: Int
  `;

const listParamsValue = `
  page: $page
  perPage: $perPage
  searchValue: $searchValue
  startDate: $startDate
  endDate: $endDate
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const periodLocks = `
  query savingsPeriodLocks(${listParamsDef}) {
    savingsPeriodLocks(${listParamsValue}) {
      ${periodLockFields}
    }
  }
`;

export const periodLocksMain = `
  query savingsPeriodLocksMain(${listParamsDef}) {
    savingsPeriodLocksMain(${listParamsValue}) {
      list {
        ${periodLockFields}
      }

      totalCount
    }
  }
`;

export const periodLockDetailFields = `
  generals
`;

export const periodLockDetail = `
  query savingsPeriodLockDetail($_id: String!) {
    savingsPeriodLockDetail(_id: $_id) {
      ${periodLockFields}
      ${periodLockDetailFields}
    }
  }
`;

export default {
  periodLocks,
  periodLocksMain,
  periodLockDetail
};
