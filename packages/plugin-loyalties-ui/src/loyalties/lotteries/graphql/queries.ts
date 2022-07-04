import { commonFields, commonParamsDef, commonParamsValue } from '../../common/graphq';

export const lotteryFields = `
  ${commonFields}
  status
  number
`;

export const voucherDetailField = `
  _id
  buyScore
  createdAt
  createdBy
  description
  discountPercent
  endDate
  finishDateOfUse
  lotteryCampaignId
  lotteryCount
  modifiedAt
  modifiedBy
  score
  scoreAction
  spinCampaignId
  spinCount
  startDate
  status
  title
  voucherType
  vouchersCount
  productIds
  productCategoryIds
`;

const listParamsDef = `
  ${commonParamsDef}
  $voucherCampaignId: String
`;

const listParamsValue = `
  ${commonParamsValue}
  voucherCampaignId: $voucherCampaignId
`;

export const lotteries = `
  query lotteries(${listParamsDef}) {
    lotteries(${listParamsValue}) {
      ${lotteryFields}
    }
  }
`;

export const lotteriesMain = `
  query lotteriesMain(${listParamsDef}) {
    lotteriesMain(${listParamsValue}) {
      list {
        ${lotteryFields}
      }

      totalCount
    }
  }
`;
export const lotteryCampaignWinnerList = `
  query lotteryCampaignWinnerList(${listParamsDef},$awardId: String) {
    lotteryCampaignWinnerList(${listParamsValue},awardId:$awardId) {
      list {
        ${lotteryFields}
      }

      totalCount
    }
  }
`;
export const lotteriesCampaignMain = `
  query lotteriesCampaignCustomerList(${listParamsDef}) {
    lotteriesCampaignCustomerList(${listParamsValue}) {
      list {
        ${lotteryFields}
      }

      totalCount
    }
  }
`;
const lotteryDetail = `
  query lotteryDetail($_id: String!) {
    lotteryDetail(_id: $_id) {
      ${lotteryFields}
    }
  }
`;

export default {
  lotteries,
  lotteriesMain,
  lotteryDetail,
  lotteriesCampaignMain,
  lotteryCampaignWinnerList
};
