import { GQL_PAGE_INFO } from 'erxes-ui';
import gql from 'graphql-tag';

export const GET_PROJECTS = gql`
  query GetProjects(
    $filter: IProjectFilter
  ) {
    getProjects(
      filter: $filter
    ) {
      list {
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
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_PROJECTS_INLINE = gql`
  query GetProjectsInline($filter: IProjectFilter) {
    getProjects(filter: $filter) {
      list {
        _id
        name
        status
      }
       ${GQL_PAGE_INFO}
    }
  }
`;
