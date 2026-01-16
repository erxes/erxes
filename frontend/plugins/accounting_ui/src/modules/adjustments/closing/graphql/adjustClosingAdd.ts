import { gql } from '@apollo/client';

export const ADJUST_CLOSING_ADD = gql`
  mutation AdjustClosingAdd(
    $status: String
    $date: Date
    $description: String
    $beginDate: Date
    $integrateAccountId: String
    $periodGLAccountId: String
    $earningAccountId: String
    $taxPayableAccountId: String
  ) {
    adjustClosingEntriesAdd(
      status: $status
      date: $date
      description: $description
      beginDate: $beginDate
      integrateAccountId: $integrateAccountId
      periodGLAccountId: $periodGLAccountId
      earningAccountId: $earningAccountId
      taxPayableAccountId: $taxPayableAccountId
    ) {
      _id
      createdAt
      createdBy
      updatedAt
      modifiedBy

      status
      date
      beginDate
      description
      integrateAccountId
      periodGLAccountId
      earningAccountId
      taxPayableAccountId
    }
  }
`;
