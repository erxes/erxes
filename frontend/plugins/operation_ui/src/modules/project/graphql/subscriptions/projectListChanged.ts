import { gql } from '~/gql';

export const PROJECT_LIST_CHANGED = gql(`
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
        tagIds
        leadId
        memberIds
        createdBy
        startDate
        targetDate
        createdAt
        updatedAt
      }
    }
  }
`);
