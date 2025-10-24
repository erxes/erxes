import { commonTypes, commonInputs, commonFilters } from './common';

export const types = `
  type Assignment @key(fields: "_id") @cacheControl(maxAge: 3) {
    ${commonTypes}
    segmentIds: [String]
    status: String
    voucherId: String
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
  checkAssignment(customerId: String, _ids: [String]): JSON
`;

const AssignmentDoc = `
  ${commonInputs}
  segmentIds: [String]
`;

export const mutations = `
  assignmentsAdd(${AssignmentDoc}): Assignment
  assignmentsRemove(_ids: [String]): JSON
  cpAssignmentsAdd(${AssignmentDoc}): Assignment
  cpAssignmentsRemove(_ids: [String]): JSON
`;
