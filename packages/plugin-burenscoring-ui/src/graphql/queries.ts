import {
  conformityQueryFieldDefs,
  conformityQueryFields,
} from '@erxes/ui-sales/src/conformity/graphql/queries';

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
const fintechParams = `
  $keyword: String,
  $reportPurpose: String
`;

const fintechParamsDefs = `
  keyword: $keyword,
  reportPurpose: $reportPurpose
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

export const getCustomerScore = `
    query GetCustomerScore($customerId: String!) {
      getCustomerScore(customerId: $customerId) {
        ${burenCustomerScoringFields}
      }
    }
`;

export const getCustomerScoring = `
query getCustomerScoring(${fintechParams}) {
  getCustomerScoring(${fintechParamsDefs})
}
`;
export const fieldsCombinedByContentType = `query fieldsCombinedByContentType($contentType: String!) {
  fieldsCombinedByContentType(contentType: $contentType)
}`;
export const getRegister = `query Query($customerId: String!) {
  getRegister(customerId: $customerId)
}`;
const BurenConfigs = `
  query configs {
    configs {
      _id
      code
      value
    }
  }
`;

const customers = `
  query customers(${conformityQueryFields}) {
    customers(${conformityQueryFieldDefs}) {
      _id
      firstName
      primaryPhone
      primaryEmail
    }
  }
`;
export default {
  burenCustomerScoringsMain,
  getCustomerScore,
  getCustomerScoring,
  BurenConfigs,
  fieldsCombinedByContentType,
  getRegister,
  customers,
};
