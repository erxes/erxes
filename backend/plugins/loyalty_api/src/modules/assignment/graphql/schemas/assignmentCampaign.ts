export const types = `
  type AssignmentCampaign {
    _id: String
    name: String
    description: String
    status: String

    fieldId: String
    segmentIds: [String]
    allowMultiWin: Boolean
    voucherCampaignId: String

    createdAt: String
    updatedAt: String
    createdBy: String
    updatedBy: String

    assignmentsCount: Int
  }
`;
const queryParams = `
  status: String
  searchValue: String
`;

export const queries = `
  getAssignmentCampaigns(${queryParams}): [AssignmentCampaign]
  getAssignmentCampaignDetail(_id: String!): AssignmentCampaign
`;


const mutationParams = `
  name: String
  description: String
  status: String

  segmentIds: [String]
  fieldId: String
  allowMultiWin: Boolean
  voucherCampaignId: String
`;

export const mutations = `
  createAssignmentCampaign(${mutationParams}): AssignmentCampaign
  updateAssignmentCampaign(_id: String!, ${mutationParams}): AssignmentCampaign
  removeAssignmentCampaign(_id: String!): AssignmentCampaign
`;
