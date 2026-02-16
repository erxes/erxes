import { gql } from '@apollo/client';

export const ADJUST_CLOSING_RUN = gql`
  mutation AdjustClosingRun($id: String!) {
    adjustClosingRun(_id: $id) {
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
