import { gql } from '@apollo/client';

export const ADJUST_CLOSING_EDIT = gql`
  mutation AdjustClosingEdit(
    $_id: String!
    $description: String
    $integrateAccountId: String
    $periodGLAccountId: String
    $earningAccountId: String
    $taxPayableAccountId: String
    $beginDate: Date
    $detailId: String
    $entryId: String
    $percent: Float
  ) {
    adjustClosingEdit(
      _id: $_id
      description: $description
      integrateAccountId: $integrateAccountId
      periodGLAccountId: $periodGLAccountId
      earningAccountId: $earningAccountId
      taxPayableAccountId: $taxPayableAccountId
      beginDate: $beginDate
      detailId: $detailId
      entryId: $entryId
      percent: $percent
    ) {
      _id
      status
      description
      details {
        _id
        entries {
          _id
          percent
        }
      }
      updatedAt
    }
  }
`;
