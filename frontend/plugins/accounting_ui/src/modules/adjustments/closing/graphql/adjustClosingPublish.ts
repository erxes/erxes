import { gql } from '@apollo/client';

export const ADJUST_CLOSING_PUBLISH = gql`
  mutation AdjustClosingPublish($adjustId: String!) {
    adjustClosingPublish(adjustId: $adjustId) {
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
