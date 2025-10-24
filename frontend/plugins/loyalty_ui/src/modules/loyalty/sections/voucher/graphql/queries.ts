import gql from 'graphql-tag';
import {
  commonFields,
  commonParamsDef,
  commonParamsValue,
} from '~/modules/loyalty/graphql/graphq';

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

export const vouchersMain = gql`
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

export const commonParamDefs = `
  $title: String,
  $description: String,
  $startDate: Date,
  $endDate: Date,
  $finishDateOfUse: Date,
  $attachment: AttachmentInput,
  $status: String,
`;

export const commonParams = `
  title: $title
  description: $description
  startDate: $startDate
  endDate: $endDate
  finishDateOfUse: $finishDateOfUse
  attachment: $attachment
  status: $status
`;

export const commonFields1 = `
  createdAt
  createdBy
  modifiedAt
  modifiedBy
  title
  description
  startDate
  endDate
  finishDateOfUse
  attachment {
    url
    name
    size
    type
  }
  status
`;

export const paginateDefs = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int,
`;

export const paginateValues = `
  page: $page,
  perPage: $perPage,
  sortField: $sortField,
  sortDirection: $sortDirection,
`;

export const commonFilterDefs = `
  $_ids:[String],
  $searchValue: String,
  $filterStatus: String,
`;

export const commonFilterValues = `
  _ids: $_ids,
  searchValue: $searchValue,
  filterStatus: $filterStatus,
`;
export const voucherCampaignFields = `
  _id
  ${commonFields1}
  buyScore

  score
  scoreAction
  voucherType
  productCategoryIds
  productIds
  discountPercent
  bonusProductId
  bonusCount
  coupon
  spinCampaignId
  spinCount
  lotteryCampaignId
  lotteryCount

  vouchersCount
  codesCount

  kind
  value
  restrictions
`;
const voucherCampaigns = gql`
  query voucherCampaigns(${commonFilterDefs} ${paginateDefs} $equalTypeCampaignId: String $voucherType: String) {
    voucherCampaigns(${commonFilterValues} ${paginateValues} equalTypeCampaignId: $equalTypeCampaignId voucherType: $voucherType) {
      ${voucherCampaignFields}
    }
  }
`;

const voucherCampaignsCount = gql`
  query voucherCampaignsCount(${commonFilterDefs}) {
    voucherCampaignsCount(${commonFilterValues})
  }
`;

const voucherCampaignDetail = gql`
  query VoucherCampaignDetail($id: String) {
    voucherCampaignDetail(_id: $id) {
      ${voucherCampaignFields}
    }
  }
`;
export default {
  vouchers,
  ownerVouchers,
  vouchersMain,
  voucherDetail,
  voucherCampaigns,
  voucherCampaignsCount,
  voucherCampaignDetail,
};
