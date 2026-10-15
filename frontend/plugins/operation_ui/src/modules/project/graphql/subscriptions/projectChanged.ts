import { gql } from '~/gql';

export const PROJECT_CHANGED = gql(`
  subscription operationProjectChanged($_id: String!) {
    operationProjectChanged(_id: $_id) {
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
        convertedFromId
        startDate
        targetDate
        createdAt
        updatedAt
        propertiesData
      }
    }
  }
`);
