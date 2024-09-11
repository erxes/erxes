import { queries } from "@erxes/ui-products/src/graphql";
import { commonFields, commonListFields } from "../../boards/graphql/mutations";
import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from "../../conformity/graphql/queries";

const commonParams = `
  $companyIds: [String],
  $customerIds: [String],
  $assignedUserIds: [String],
  $productIds: [String],
  $labelIds: [String],
  $search: String,
  $priority: [String],
  $date: PurchasesItemDate,
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
  $createdStartDate: Date
  $createdEndDate: Date
  $stateChangedStartDate: Date
  $stateChangedEndDate: Date
  $startDateStartDate: Date
  $startDateEndDate: Date
  $closeDateStartDate: Date
  $closeDateEndDate: Date
  ${conformityQueryFields}
`;

const commonParamDefs = `
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
  createdStartDate: $createdStartDate
  createdEndDate: $createdEndDate
  stateChangedStartDate: $stateChangedStartDate
  stateChangedEndDate: $stateChangedEndDate
  startDateStartDate: $startDateStartDate
  startDateEndDate: $startDateEndDate
  closeDateStartDate: $closeDateStartDate
  closeDateEndDate: $closeDateEndDate
  ${conformityQueryFieldDefs}
`;

export const purchaseFields = `
  products
  productsData
  paymentsData
  expensesData
  unUsedAmount
  amount
`;

const purchasesTotalAmounts = `
  query purchasesTotalAmounts(
    ${commonParams}
  ) {
    purchasesTotalAmounts(
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

const purchases = `
  query purchases(
    $initialStageId: String,
    $stageId: String,
    $skip: Int,
    $limit: Int,
    ${commonParams}
  ) {
    purchases(
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

const purchasesTotalCount = `
  query purchasesTotalCount(
    $initialStageId: String,
    $stageId: String,
    $skip: Int,
    ${commonParams}
  ) {
    purchasesTotalCount(
      initialStageId: $initialStageId,
      stageId: $stageId,
      skip: $skip,
      ${commonParamDefs}
    )
  }
`;

const archivedPurchasesParams = `
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

const archivedPurchasesArgs = `
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

const archivedPurchases = `
  query archivedPurchases(
    $page: Int
    $perPage: Int
    ${archivedPurchasesParams}
  ) {
    archivedPurchases(
      page: $page
      perPage: $perPage
      ${archivedPurchasesArgs}
    ) {
      ${purchaseFields}
      ${commonFields}
    }
  }
`;

const archivedPurchasesCount = `
  query archivedPurchasesCount(
    ${archivedPurchasesParams}
  ) {
    archivedPurchasesCount(
      ${archivedPurchasesArgs}
    )
  }
`;

const purchaseDetail = `
  query purchaseDetail($_id: String!) {
    purchaseDetail(_id: $_id) {
      ${purchaseFields}
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
  query purchaseCheckDiscount($_id: String!, $products: [PurchasesProductField]) {
    purchaseCheckDiscount(_id: $_id, products: $products)
  }
`;

const productsPriceLast = `
  query productsPriceLast($purchaseId: String, $productIds: [String]) {
    productsPriceLast(purchaseId: $purchaseId, productIds: $productIds)
  }
`;

const productCategories = queries.productCategories;

const convertToInfo = `
  query purchasesConvertToInfo($conversationId: String!) {
     purchasesConvertToInfo(conversationId: $conversationId) {
      purchaseUrl
    }
  }
`;

export default {
  convertToInfo,
  purchases,
  purchasesTotalCount,
  purchaseDetail,
  productDetail,
  productCategories,
  purchasesTotalAmounts,
  archivedPurchases,
  archivedPurchasesCount,
  checkDiscount,
  productsPriceLast
};
