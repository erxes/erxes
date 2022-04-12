import { commonFields, commonParamsDef, commonParamsValue } from '../../common/graphq';

export const lotteryFields = `
  ${commonFields}
  status
  number
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
};
