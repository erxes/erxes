import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Assignment {
    _id: String
    campaignId: String,
    createdAt: Date,
    usedAt: Date,
    voucherCampaignId: String,
  
    ownerType: String,
    ownerId: String,
  
    owner: JSON
    
    segmentIds: [String]
    status: String
    voucherId: String
  }

  type AssignmentListResponse {
    list: [Assignment]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  searchValue: String,
  campaignId: String,
  ownerType: String,
  ownerId: String,
  status: String,

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  assignments(${queryParams}): AssignmentListResponse
  assignmentDetail(_id: String!): Assignment
  checkAssignment(customerId: String!, _ids: [String]): JSON
`;

const mutationParams = `
  campaignId: String,
  ownerType: String,
  ownerId: String,
  usedAt: Date,

  segmentIds: [String],
`;

export const mutations = `
  assignmentsAdd(${mutationParams}): Assignment
  assignmentsRemove(_id: String!): JSON
  cpAssignmentsAdd(${mutationParams}): Assignment
  cpAssignmentsRemove(_ids: [String]): JSON
`;
