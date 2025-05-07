import {
  commonCampaignInputs,
  commonCampaignTypes,
  commonFilterTypes,
  paginateTypes,
} from './common';

export const types = `

    enum Kind {
        amount
        percent
    }

    type CouponCampaign @key(fields: "_id") @cacheControl(maxAge: 3) {
        _id: String!

        ${commonCampaignTypes}

        kind: Kind
        value: Int
        codeRule: JSON
        restrictions: JSON
        redemptionLimitPerUser: Int

        buyScore: Int
    }
`;

export const queries = `
    couponCampaign(_id:String): CouponCampaign
    couponCampaigns(${commonFilterTypes} ${paginateTypes}): [CouponCampaign]
`;

const couponCampaignParams = `
    ${commonCampaignInputs}

    kind: Kind
    value: Int
    codeRule: JSON
    restrictions: JSON
    redemptionLimitPerUser: Int
    
    buyScore: Int
    charSet: [String]
    `;

export const mutations = `
    couponCampaignAdd(${couponCampaignParams}): CouponCampaign
    couponCampaignEdit(_id: String, ${couponCampaignParams}): CouponCampaign
    couponCampaignsRemove(_ids: [String]): JSON
`;
