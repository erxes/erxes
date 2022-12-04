import { commonTypes, commonInputs, commonFilters } from './common';

export const types = `
  type Assignment @key(fields: "_id") @cacheControl(maxAge: 3) {
    ${commonTypes}
  }

  type AssignmentMain {
    list: [Assignment]
    totalCount: Int
  }
`;

export const queries = `
  assignmentsMain(${commonFilters}): AssignmentMain
  assignments(${commonFilters}): [Assignment]
  assignmentDetail(_id: String!): Assignment
`;

const AssignmentDoc = `
  ${commonInputs}
  assignmentScore: Float
`;

export const mutations = `
  assignmentsAdd(${AssignmentDoc}): Assignment
  assignmentsRemove(_ids: [String]): JSON
  cpAssignmentsAdd(${AssignmentDoc}): Assignment
  cpAssignmentsRemove(_ids: [String]): JSON
`;
