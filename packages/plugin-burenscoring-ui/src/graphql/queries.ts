const commonHistoryParams = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int,
  $startDate: Date,
  $endDate: Date,
  $customerId: String,
`;

const commonHistoryParamDefs = `
  page: $page,
  perPage: $perPage,
  sortField: $sortField,
  sortDirection: $sortDirection,
  startDate: $startDate,
  endDate: $endDate,
  customerId: $customerId,
`;

export const burenCustomerScoringFields = `

  _id
  externalScoringResponse
  score
  customerId
  reportPurpose
  keyword
  restInquiryResponse
  createdAt
  createdBy
`;
const burenCustomerScoringsMain = `
  query BurenCustomerScoringsMain(
    ${commonHistoryParams}
  ) {
    burenCustomerScoringsMain (
      ${commonHistoryParamDefs}
    ) {
      list {
      ${burenCustomerScoringFields}
      }
      totalCount
    }
  }
`;

export default {
  burenCustomerScoringsMain
};
