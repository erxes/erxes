import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type ScoreCampaign {
    _id: String,
    title: String,
    description:String,
    order: Int,
    add:JSON,
    subtract:JSON,
    createdAt:Date,
    createdUserId:String,
    status:String,
    ownerType:String,
    accountTypeId:String,
    accountType: LoyaltyAccountType,
    fieldId:String,
    serviceName:String,
    additionalConfig:JSON

    restrictions: JSON
  }

  type ScoreCampaignEarnPreview {
    tierKey: String
    tierName: String
    total: Float
    breakdown: JSON
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
  scoreCampaignServices: JSON
  scoreCampaignEarnPreview(accountTypeId: String, table: JSON!, amount: Float!): [ScoreCampaignEarnPreview]
  checkOwnerScore(ownerId:String, ownerType:String, campaignId:String, action:String, clientPortal:String): JSON
  cpCheckOwnerScore(ownerId:String, ownerType:String, campaignId:String, action:String, clientPortal:String): JSON
`;

const mutationParams = `
  title: String,
  description:String,
  order: Int,
  add:JSON,
  subtract:JSON,
  createdAt:Date,
  createdUserId:String,
  status:String,
  accountTypeId: String
  serviceName:String
  additionalConfig:JSON
  restrictions: JSON
`;

export const mutations = `
  scoreCampaignAdd(${mutationParams}): JSON
  scoreCampaignUpdate(_id:String, ${mutationParams}): ScoreCampaign
  scoreCampaignRemove(_id:String): JSON
  scoreCampaignsRemove(_ids:[String]): JSON
  refundLoyaltyScore(ownerId:String, ownerType:String, targetId:String): JSON
`;
