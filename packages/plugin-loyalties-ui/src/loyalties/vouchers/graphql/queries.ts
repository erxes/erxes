import {
  commonFields,
  commonParamsDef,
  commonParamsValue,
} from "../../common/graphq";

export const voucherFields = `
  ${commonFields}
  status
`;

const listParamsDef = `
  ${commonParamsDef}
  $searchValue: String
  $fromDate: String
  $toDate: String
`;

const listParamsValue = `
  ${commonParamsValue}
  searchValue: $searchValue
  fromDate: $fromDate
  toDate: $toDate
`;

export const vouchers = `
  query vouchers(${listParamsDef}) {
    vouchers(${listParamsValue}) {
      ${voucherFields}
    }
  }
`;

export const ownerVouchers = `
  query ownerVouchers($ownerId: String!) {
    ownerVouchers(ownerId: $ownerId)
  }
`;

export const vouchersMain = `
  query vouchersMain(${listParamsDef}) {
    vouchersMain(${listParamsValue}) {
      list {
        ${voucherFields}
      }

      totalCount
    }
  }
`;

const voucherDetail = `
  query voucherDetail($_id: String!) {
    voucherDetail(_id: $_id) {
      ${voucherFields}
      campaign
    }
  }
`;

export default {
  vouchers,
  ownerVouchers,
  vouchersMain,
  voucherDetail,
};
