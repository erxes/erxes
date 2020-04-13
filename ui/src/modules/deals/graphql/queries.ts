import { commonFields } from 'modules/boards/graphql/mutations';
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
      dealCount
      totalForType {
        _id
        name
        currencies {
          name
          amount
        }
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
      _id
      name
      stageId
      products
      amount
      pipeline {
        _id
        name
      }
      boardId
      closeDate
      description
      priority
      assignedUsers {
        _id
        email
        details {
          fullName
          avatar
        }
      }
      customers {
        _id
        firstName
        lastName
        primaryEmail
        primaryPhone
        visitorContactInfo
      }
      labels {
        _id
        name
        colorCode
      }
      stage {
        probability
      }
      isWatched
      modifiedAt
      modifiedBy
      reminderMinute
      isComplete
      status
      createdUser {
        _id
        details {
          fullName
          avatar
        }
      }
      order
    }
  }
`;

const archivedDeals = `
  query archivedDeals(
    $pipelineId: String!,
    $search: String,
    $page: Int,
    $perPage: Int,
  ) {
    archivedDeals(
      pipelineId: $pipelineId,
      search: $search,
      page: $page,
      perPage: $perPage,
    ) {
      ${dealFields}
      ${commonFields}
    }
  }
`;

const archivedDealsCount = `
  query archivedDealsCount(
    $pipelineId: String!,
    $search: String
  ) {
    archivedDealsCount(
      pipelineId: $pipelineId,
      search: $search
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
  dealDetail,
  productDetail,
  dealsTotalAmounts,
  archivedDeals,
  archivedDealsCount
};
