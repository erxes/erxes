import gql from 'graphql-tag';

export const GET_PROJECT = gql`
  query getProject($_id: String!) {
    getProject(_id: $_id) {
      _id
      name
      icon
      description
      status
      priority
      teamIds
      tagIds
      leadId
      startDate
      targetDate
      createdBy
      createdAt
      updatedAt
    }
  }
`;
