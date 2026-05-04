import { gql } from '@apollo/client';

export const ADJUST_CLOSING_DETAIL_QUERY = gql`
  query AdjustClosingDetail($_id: String!) {
    adjustClosingDetail(_id: $_id) {
      _id
      branchId
      departmentId
      beginDate
      date
      status
      description
      integrateAccountId
      periodGLAccountId
      earningAccountId
      closeIntegrateTrId
      periodGLTrId
      createdAt
      updatedAt
      entries {
        _id
        accountId
        balance
        percent
        mainAccTrId
        integrateTrId
      }
    }
  }
`;

export const ADJUST_CLOSING_DETAILS = gql`
  query AdjustClosingDetails($_id: String!) {
    adjustClosingDetail(_id: $_id) {
      _id
      branchId
      departmentId
      entries {
        _id
        code
      }
      closeIntegrateTrId
      periodGLTrId
      createdAt
      updatedAt
    }
    adjustClosingEntriesCount(_id: $_id)
  }
`;
