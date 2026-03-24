import { gql } from '@apollo/client';

export const ADJUST_CLOSING_EDIT = gql`
  mutation AdjustClosingEdit(
    $_id: String!
    $description: String
    $integrateAccountId: String
    $periodGLAccountId: String
    $earningAccountId: String
    $taxPayableaccountId: String
    $beginDate: Date
  ) {
    adjustClosingEdit(
      _id: $_id
      description: $description
      integrateAccountId: $integrateAccountId
      periodGLAccountId: $periodGLAccountId
      earningAccountId: $earningAccountId
      taxPayableaccountId: $taxPayableaccountId
      beginDate: $beginDate
    ) {
      _id
      description
      updatedAt
    }
  }
`;