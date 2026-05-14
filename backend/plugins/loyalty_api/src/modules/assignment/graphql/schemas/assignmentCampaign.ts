import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type AssignmentCampaign @key(fields: "_id"){
    _id: String
    createdAt: Date
    createdBy: String
    modifiedAt: Date
    modifiedBy: String
    title: String
    description: String
    startDate: Date
    endDate: Date
    finishDateOfUse: Date
    attachment: Attachment
    status: String
    fieldId: String
    segmentIds: [String]
    allowMultiWin:Boolean
    voucherCampaignId: String
  }

  type AssignmentCampaignListResponse {
    list: [AssignmentCampaign]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  searchValue: String
  status: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  assignmentCampaignDetail(_id: String!): AssignmentCampaign
  assignmentCampaigns(${queryParams}): AssignmentCampaignListResponse
`;

const mutationParams = `
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  finishDateOfUse: Date,
  numberFormat:String,
  attachment: AttachmentInput,
  status: String,
  segmentIds: [String]
  fieldId: String
  allowMultiWin:Boolean
  voucherCampaignId: String
`;

export const mutations = `
  assignmentCampaignsAdd(${mutationParams}): AssignmentCampaign
  assignmentCampaignsEdit(_id: String!, ${mutationParams}): AssignmentCampaign
  assignmentCampaignsRemove(_ids: [String]): JSON
`;
