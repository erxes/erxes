import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from 'modules/conformity/graphql/queries';

const commonParams = `
  $companyIds: [String],
  $customerIds: [String],
  $assignedUserIds: [String],
  $nextDay: String,
  $nextWeek: String,
  $nextMonth: String,
  $noCloseDate: String,
  $overdue: String,
  $productIds: [String],
  ${conformityQueryFields}
`;

const commonParamDefs = `
  companyIds: $companyIds,
  customerIds: $customerIds,
  assignedUserIds: $assignedUserIds,
  nextDay: $nextDay,
  nextWeek: $nextWeek,
  nextMonth: $nextMonth,
  noCloseDate: $noCloseDate,
  overdue: $overdue,
  productIds: $productIds,
  ${conformityQueryFieldDefs}
`;

export const dealFields = `
  _id
  name
  stageId
  hasNotified
  pipeline {
    _id
    name
  }
  boardId
  companies {
    _id
    primaryName
    website
  }
  customers {
    _id
    firstName
    lastName
    primaryEmail
    primaryPhone
    visitorContactInfo
  }
  products
  productsData
  amount
  closeDate
  description
  assignedUsers {
    _id
    email
    details {
      fullName
      avatar
    }
  }
  labels {
    _id
    name
    colorCode
  }
  labelIds
  stage {
    probability
    name
  }
  isWatched
  attachments {
    name
    url
    type
    size
  }
  modifiedAt
  modifiedBy
  reminderMinute
  isComplete
`;

const dealsTotalAmounts = `
  query dealsTotalAmounts(
    $date: ItemDate
    $pipelineId: String
    ${commonParams}
  ) {
    dealsTotalAmounts(
      date: $date
      pipelineId: $pipelineId
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
    $pipelineId: String,
    $stageId: String,
    $date: ItemDate,
    $skip: Int,
    $search: String
    $labelIds: [String],
    ${commonParams}
  ) {
    deals(
      pipelineId: $pipelineId,
      initialStageId: $initialStageId,
      stageId: $stageId,
      date: $date,
      skip: $skip,
      search: $search,
      labelIds: $labelIds
      ${commonParamDefs}
    ) {
      ${dealFields}
    }
  }
`;

const dealDetail = `
  query dealDetail($_id: String!) {
    dealDetail(_id: $_id) {
      ${dealFields}
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
  dealsTotalAmounts
};
