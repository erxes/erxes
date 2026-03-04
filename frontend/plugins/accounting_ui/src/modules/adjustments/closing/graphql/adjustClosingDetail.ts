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

      entries {
        _id
        code
        name
        description
        status
        integrateAccountId
        periodGLAccountId
        balance
        percent
        mainAccTrId
        integrateTrId
      }

      closeIntegrateTrId
      periodGLTrId
      createdAt
      updatedAt
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
    adjustClosingEntriesCount
  }
`;
