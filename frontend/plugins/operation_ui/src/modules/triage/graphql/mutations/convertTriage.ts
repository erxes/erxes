import gql from 'graphql-tag';

export const CONVERT_TRIAGE_TO_TASK = gql`
  mutation ConvertToTask($id: String!) {
    operationConvertTriageToTask(_id: $id) {
      _id
    }
  }
`;
