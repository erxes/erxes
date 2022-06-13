import { queries as customerQueries } from '@erxes/ui/src/customers/graphql';
import {
  commonFields,
  commonParamsDef,
  commonParamsValue
} from '../../common/graphq';

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

const lotteryDetails = `
query VoucherCampaignDetails($id: [String!]) {
  voucherCampaignDetails(_id: $id) 
  }
`;

const customerDetail = `
  query customerDetail($_id: String!) {
    customerDetail(_id: $_id) {
      ${customerQueries.customerFields}
    }
  }
`;

export default {
  lotteries,
  lotteriesMain,
  lotteryDetail,
  lotteryDetails,
  lotteriesCampaignMain,
  lotteryCampaignWinnerList,
  customerDetail
};
