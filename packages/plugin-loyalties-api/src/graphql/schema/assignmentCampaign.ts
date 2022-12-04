import {
  commonCampaignInputs,
  commonCampaignTypes,
  commonFilterTypes,
  paginateTypes
} from './common';

export const types = `
  type AssignmentCampaign @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    ${commonCampaignTypes}
    segmentData: String
  }
`;

export const queries = `
  assignmentCampaignDetail(_id: String!): AssignmentCampaign
  assignmentCampaigns(${commonFilterTypes} ${paginateTypes}): [AssignmentCampaign]
  assignmentCampaignsCount(${commonFilterTypes}): Int
`;

const AssignmentCampaignDoc = `
  ${commonCampaignInputs}
  segmentData: String
`;

export const mutations = `
  assignmentCampaignsAdd(${AssignmentCampaignDoc}): AssignmentCampaign
  assignmentCampaignsEdit(_id: String!, ${AssignmentCampaignDoc}): AssignmentCampaign
  assignmentCampaignsRemove(_ids: [String]): JSON
`;
