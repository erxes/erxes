import { gql } from '@apollo/client';

export const CONVERT_TO_PROJECT = gql`
  mutation ConvertToProject($id: String!) {
    convertToProject(_id: $id) {
      _id
      name
      icon
      status
      priority
      teamIds
      leadId
      startDate
      targetDate
      createdAt
      updatedAt
    }
  }
`;
