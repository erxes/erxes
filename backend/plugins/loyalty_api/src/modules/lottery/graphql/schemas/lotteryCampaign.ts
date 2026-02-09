import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';
import { commonCampaignInputs, commonCampaignTypes } from '~/utils';

export const types = `
  type LotteryCampaign {
    _id: String
    ${commonCampaignTypes}

    numberFormat: String
    buyScore: Float
    awards: JSON

    lotteriesCount: Int,

    updatedAt: String
  }

  type LotteryCampaignListResponse {
    list: [LotteryCampaign]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  status: String
  searchValue: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  lotteryCampaigns(${queryParams}): LotteryCampaignListResponse
  lotteryCampaignDetail(_id: String!): LotteryCampaign
  lotteryCampaignWinnerList(campaignId: String!, awardId: String!): JSON
  lotteriesCampaignCustomerList(campaignId: String!): JSON
  cpLotteryCampaigns: [LotteryCampaign]
`;

const mutationParams = `
  ${commonCampaignInputs}

  numberFormat: String
  buyScore: Float
  awards: JSON
`;

export const mutations = `
  lotteryCampaignsAdd(${mutationParams}): LotteryCampaign
  lotteryCampaignsEdit(_id: String!, ${mutationParams}): LotteryCampaign
  lotteryCampaignsRemove(_ids: [String]): JSON
  doLottery(campaignId: String, awardId: String ): JSON
  doLotteryMultiple(campaignId: String, awardId: String,multiple: Int): String
  getNextChar(campaignId: String, awardId: String, prevChars: String):JSON
`;
