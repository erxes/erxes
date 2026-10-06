import { gql } from '~/gql';

export const GET_PROJECTS = gql(`
  query GetProjects($filter: IProjectFilter) {
    getProjects(filter: $filter) {
      list {
        _id
        name
        icon
        status
        priority
        teamIds
        tagIds
        leadId
        memberIds
        startDate
        targetDate
        createdBy
        createdAt
        updatedAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);

export const GET_PROJECTS_INLINE = gql(`
  query GetProjectsInline($filter: IProjectFilter) {
    getProjects(filter: $filter) {
      list {
        _id
        name
        status
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);
