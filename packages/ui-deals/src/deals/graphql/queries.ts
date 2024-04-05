import { queries } from '@erxes/ui-products/src/graphql';
import { commonFields, commonListFields } from '../../boards/graphql/mutations';
import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '../../conformity/graphql/queries';

const commonParams = `
  $_ids: [String]
  $companyIds: [String],
  $customerIds: [String],
  $assignedUserIds: [String],
  $productIds: [String],
  $labelIds: [String],
  $search: String,
  $priority: [String],
  $date: ItemDate,
  $pipelineId: String,
  $parentId: String,
  $closeDateType: String,
  $sortField: String,
  $sortDirection: Int,
  $userIds: [String],
  $segment: String,
  $segmentData:String,
  $assignedToMe: String,
  $startDate: String,
  $endDate: String,
  $tagIds: [String],
  $noSkipArchive: Boolean
  $branchIds:[String]
  $departmentIds:[String]
  ${conformityQueryFields},
  $createdStartDate: Date,
  $createdEndDate: Date,
  $stateChangedStartDate: Date
  $stateChangedEndDate: Date
  $startDateStartDate: Date
  $startDateEndDate: Date
  $closeDateStartDate: Date
  $closeDateEndDate: Date
`;

const commonParamDefs = `
  _ids: $_ids,
  companyIds: $companyIds,
  customerIds: $customerIds,
  assignedUserIds: $assignedUserIds,
  priority: $priority,
  productIds: $productIds,
  labelIds: $labelIds,
  search: $search,
  date: $date,
  pipelineId: $pipelineId,
  parentId: $parentId,
  closeDateType: $closeDateType,
  sortField: $sortField,
  sortDirection: $sortDirection,
  userIds: $userIds,
  segment: $segment,
  segmentData: $segmentData,
  assignedToMe: $assignedToMe,
  startDate: $startDate,
  endDate: $endDate,
  tagIds: $tagIds,
  noSkipArchive: $noSkipArchive
  branchIds: $branchIds,
  departmentIds: $departmentIds,
  ${conformityQueryFieldDefs},
  createdStartDate: $createdStartDate,
  createdEndDate: $createdEndDate,
  stateChangedStartDate: $stateChangedStartDate
  stateChangedEndDate: $stateChangedEndDate
  startDateStartDate: $startDateStartDate
  startDateEndDate: $startDateEndDate
  closeDateStartDate: $closeDateStartDate
  closeDateEndDate: $closeDateEndDate
`;

export const dealFields = `
  products
  productsData
  paymentsData
  unUsedAmount
  amount
`;

const dealsTotalAmounts = `
  query dealsTotalAmounts(
    ${commonParams}
  ) {
    dealsTotalAmounts(
      ${commonParamDefs}
    ) {
        _id
        name
        currencies {
          name
          amount
        }
      }
    }
`;

const deals = `
  query deals(
    $initialStageId: String,
    $stageId: String,
    $skip: Int,
    $limit: Int,
    ${commonParams}
  ) {
    deals(
      initialStageId: $initialStageId,
      stageId: $stageId,
      skip: $skip,
      limit: $limit,
      ${commonParamDefs}
    ) {
      products
      unUsedAmount
      amount
      ${commonListFields}
    }
  }
`;

const dealsTotalCount = `
  query dealsTotalCount(
    $initialStageId: String,
    $stageId: String,
    $skip: Int,
    ${commonParams}
  ) {
    dealsTotalCount(
      initialStageId: $initialStageId,
      stageId: $stageId,
      skip: $skip,
      ${commonParamDefs}
    )
  }
`;

const archivedDealsParams = `
  $pipelineId: String!
  $search: String
  $userIds: [String]
  $priorities: [String]
  $assignedUserIds: [String]
  $labelIds: [String]
  $productIds: [String]
  $companyIds: [String]
  $customerIds: [String]
  $startDate: String
  $endDate: String
`;

const archivedDealsArgs = `
  pipelineId: $pipelineId
  search: $search
  userIds: $userIds
  priorities: $priorities
  assignedUserIds: $assignedUserIds
  labelIds: $labelIds
  productIds: $productIds
  companyIds: $companyIds
  customerIds: $customerIds
  startDate: $startDate
  endDate: $endDate
`;

const archivedDeals = `
  query archivedDeals(
    $page: Int
    $perPage: Int
    ${archivedDealsParams}
  ) {
    archivedDeals(
      page: $page
      perPage: $perPage
      ${archivedDealsArgs}
    ) {
      ${dealFields}
      ${commonFields}
    }
  }
`;

const archivedDealsCount = `
  query archivedDealsCount(
    ${archivedDealsParams}
  ) {
    archivedDealsCount(
      ${archivedDealsArgs}
    )
  }
`;

const dealDetail = `
  query dealDetail($_id: String!) {
    dealDetail(_id: $_id) {
      ${dealFields}
      ${commonFields}
    }
  }
`;

const productDetail = `
  query productDetail($_id: String!) {
    productDetail(_id: $_id) {
      _id
      name
    }
  }
`;

const checkDiscount = `
  query checkDiscount($_id: String!, $products: [ProductField]) {
    checkDiscount(_id: $_id, products: $products)
  }
`;

const productCategories = queries.productCategories;

export default {
  deals,
  dealsTotalCount,
  dealDetail,
  productDetail,
  productCategories,
  dealsTotalAmounts,
  archivedDeals,
  archivedDealsCount,
  checkDiscount
};
