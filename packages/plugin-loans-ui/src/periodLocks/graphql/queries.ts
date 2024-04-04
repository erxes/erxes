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
  query periodLocks(${listParamsDef}) {
    periodLocks(${listParamsValue}) {
      ${periodLockFields}
    }
  }
`;

export const periodLocksMain = `
  query periodLocksMain(${listParamsDef}) {
    periodLocksMain(${listParamsValue}) {
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
  query periodLockDetail($_id: String!) {
    periodLockDetail(_id: $_id) {
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
