import { GQL_CURSOR_PARAM_DEFS } from "erxes-api-shared/utils";

export const types = `
  type ScoreCampaign {
    _id: String,
    title: String,
    description:String,
    add:JSON,
    subtract:JSON,
    createdAt:Date,
    createdUserId:String,
    status:String,
    ownerType:String,
    fieldGroupId:String,
    fieldName:String,
    fieldId:String,
    fieldOrigin:String,
    serviceName:String,
    additionalConfig:JSON

    restrictions: JSON
    onlyClientPortal: Boolean
  }

  type ScoreCampaignListResponse {
    list: [ScoreCampaign]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  searchValue:String,
  status:String
  serviceName:String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  scoreCampaigns(${queryParams}): ScoreCampaignListResponse
  scoreCampaign(_id:String): ScoreCampaign
  scoreCampaignAttributes(serviceName:String): JSON
  scoreCampaignServices: JSON
  checkOwnerScore(ownerId:String,ownerType:String,campaignId:String,action:String): JSON
`;

const mutationParams = `
  title: String,
  description:String,
  add:JSON,
  subtract:JSON,
  createdAt:Date,
  createdUserId:String,
  ownerType:String,
  status:String,
  fieldGroupId:String
  fieldName: String
  fieldId: String
  fieldOrigin:String,
  serviceName:String
  additionalConfig:JSON
  restrictions: JSON
  onlyClientPortal: Boolean
`;

export const mutations = `
  scoreCampaignAdd(${mutationParams}): JSON
  scoreCampaignUpdate(_id:String, ${mutationParams}): ScoreCampaign
  scoreCampaignRemove(_id:String): JSON
  scoreCampaignsRemove(_ids:[String]): JSON
  refundLoyaltyScore(ownerId:String,ownerType:String,targetId:String): JSON
`;
