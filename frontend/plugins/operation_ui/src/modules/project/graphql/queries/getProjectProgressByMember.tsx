import gql from 'graphql-tag';

export const GET_PROJECT_PROGRESS_BY_MEMBER = gql`
  query getProjectProgressByMember($_id: String!) {
    getProjectProgressByMember(_id: $_id)
  }
`;
