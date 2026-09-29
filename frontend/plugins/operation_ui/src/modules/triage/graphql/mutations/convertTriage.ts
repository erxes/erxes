import { graphql } from '~/gql';

export const CONVERT_TRIAGE_TO_TASK = graphql(`
  mutation ConvertToTask($id: String!, $status: Int, $reason: String) {
    operationConvertTriageToTask(_id: $id, status: $status, reason: $reason) {
      _id
    }
  }
`);
