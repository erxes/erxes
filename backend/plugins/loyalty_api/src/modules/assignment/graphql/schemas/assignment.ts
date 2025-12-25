import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Assignment{
    _id: String
    
    ownerId: String
    ownerType: String
    status: String
    campaignId: String
    conditions: JSON
    
    createdAt: String
    updatedAt: String

    createdBy: String
    updatedBy: String
  }

  type AssignmentListResponse {
    list: [Assignment]
    totalCount: Int
  }
`;

const queryParams = `
  campaignId: String,
  ownerType: String,
  ownerId: String,
  status: String,

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  getAssignments(params: ${queryParams}): AssignmentListResponse
  checkAssignment(customerId: String!, _ids: [String]): Assignment
`;

const mutationParams = `
  campaignId: String,

  ownerType: String,
  ownerId: String,

  conditions: JSON,

  status: String,
`;

export const mutations = `
  createAssignment(${mutationParams}): Assignment
  updateAssignment(_id: String!, ${mutationParams}): Assignment
  removeAssignment(_id: String!): Assignment
`;
