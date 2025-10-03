import { gql } from '@apollo/client';

export const PROJECT_LIST_CHANGED = gql`
  subscription operationProjectListChanged($filter: IProjectFilter) {
    operationProjectListChanged(filter: $filter) {
      type
      project {
        _id
        name
        icon
        description
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
  }
`;
