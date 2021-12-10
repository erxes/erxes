import {
  commonFields,
  commonListFields
} from 'modules/boards/graphql/mutations';
import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from 'modules/conformity/graphql/queries';

const commonParams = `
  $companyIds: [String],
  $customerIds: [String],
  $assignedUserIds: [String],
  $productIds: [String],
  $labelIds: [String],
  $search: String,
  $priority: [String],
  $date: ItemDate,
  $pipelineId: String,
  $closeDateType: String,
  $sortField: String,
  $sortDirection: Int,
  $userIds: [String],
  $segment: String,
  $assignedToMe: String,
  $startDate: String,
  $endDate: String,
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
  closeDateType: $closeDateType,
  sortField: $sortField,
  sortDirection: $sortDirection,
  userIds: $userIds,
  segment: $segment,
  assignedToMe: $assignedToMe,
  startDate: $startDate,
  endDate: $endDate,
  ${conformityQueryFieldDefs}
`;

export const dealFields = `
  products
  productsData
  paymentsData
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
    ${commonParams}
  ) {
    deals(
      initialStageId: $initialStageId,
      stageId: $stageId,
      skip: $skip,
      ${commonParamDefs}
    ) {
      products
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

export default {
  deals,
  dealsTotalCount,
  dealDetail,
  productDetail,
  dealsTotalAmounts,
  archivedDeals,
  archivedDealsCount
};
