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
      taxPayableAccountId
      taxImpactValue
      closeIntegrateTrId
      periodGLTrId
      closePeriodTrId
      earningTrId
      taxPayableTrId
      successDate
      checkedAt
      error
      warning
      createdAt
      updatedAt
      details {
        _id
        branchId
        departmentId
        closeIntegrateTrId
        periodGLTrId
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
  }
`;

export const ADJUST_CLOSING_DETAILS = gql`
  query AdjustClosingDetails($_id: String!) {
    adjustClosingDetail(_id: $_id) {
      _id
      details {
        _id
        branchId
        departmentId
        closeIntegrateTrId
        periodGLTrId
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
    adjustClosingEntriesCount(_id: $_id)
  }
`;
