const adjustmentFields = `
  _id
  createdBy
  createdAt
  date
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

export const adjustments = `
  query adjustments(${listParamsDef}) {
    adjustments(${listParamsValue}) {
      ${adjustmentFields}
    }
  }
`;

export const adjustmentsMain = `
  query adjustmentsMain(${listParamsDef}) {
    adjustmentsMain(${listParamsValue}) {
      list {
        ${adjustmentFields}
      }

      totalCount
    }
  }
`;

export const adjustmentDetailFields = `
`;

export const adjustmentDetail = `
  query adjustmentDetail($_id: String!) {
    adjustmentDetail(_id: $_id) {
      ${adjustmentFields}
      ${adjustmentDetailFields}
    }
  }
`;

export default {
  adjustments,
  adjustmentsMain,
  adjustmentDetail
};
