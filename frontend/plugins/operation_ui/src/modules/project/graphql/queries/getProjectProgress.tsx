import gql from 'graphql-tag';

export const GET_PROJECT_PROGRESS = gql`
  query getProjectProgress($_id: String!) {
    getProjectProgress(_id: $_id)
  }
`;
