import gql from 'graphql-tag';

export const CONVERT_TRIAGE_TO_TASK = gql`
  mutation ConvertToTask($id: String!, $status: Int, $reason: String) {
    operationConvertTriageToTask(_id: $id, status: $status, reason: $reason) {
      _id
    }
  }
`;
