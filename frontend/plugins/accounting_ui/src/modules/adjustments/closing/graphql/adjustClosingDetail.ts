import { gql } from '@apollo/client';

export const ADJUST_CLOSING_DETAIL_QUERY = gql`
  query AdjustClosingDetail($_id: String!) {
    adjustClosingDetail(_id: $_id) {
      _id
      branchId
      departmentId

      entries {
        _id
        accountId
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
