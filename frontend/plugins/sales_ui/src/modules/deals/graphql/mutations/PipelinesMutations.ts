import { gql } from '~/gql';

export const ADD_PIPELINE_LABEL = gql(`
  mutation SalesPipelineLabelsAdd(
    $name: String!
    $colorCode: String!
    $pipelineId: String!
  ) {
    salesPipelineLabelsAdd(
      name: $name
      colorCode: $colorCode
      pipelineId: $pipelineId
    ) {
      _id
    }
  }
`);

export const EDIT_PIPELINE_LABEL = gql(`
  mutation SalesPipelineLabelsEdit(
    $_id: String!
    $name: String!
    $colorCode: String!
    $pipelineId: String!
  ) {
    salesPipelineLabelsEdit(
      _id: $_id
      name: $name
      colorCode: $colorCode
      pipelineId: $pipelineId
    ) {
      _id
    }
  }
`);

export const REMOVE_PIPELINE_LABEL = gql(`
  mutation SalesPipelineLabelsRemove($_id: String!) {
    salesPipelineLabelsRemove(_id: $_id)
  }
`);

export const LABEL_PIPELINE_LABEL = gql(`
  mutation SalesPipelineLabelsLabel($targetId: String!, $labelIds: [String!]!) {
    salesPipelineLabelsLabel(targetId: $targetId, labelIds: $labelIds)
  }
`);

export const ADD_PIPELINE = gql(`
  mutation salesPipelinesAdd(
    $name: String!
    $boardId: String!
    $stages: JSON
    $visibility: String!
    $memberIds: [String]
    $bgColor: String
    $startDate: Date
    $endDate: Date
    $metric: String
    $hackScoringType: String
    $templateId: String
    $isCheckDate: Boolean
    $isCheckUser: Boolean
    $isCheckDepartment: Boolean
    $excludeCheckUserIds: [String]
    $numberConfig: String
    $numberSize: String
    $nameConfig: String
    $departmentIds: [String]
    $branchIds: [String]
    $tagId: String
    $initialCategoryIds: [String]
    $excludeCategoryIds: [String]
    $excludeProductIds: [String]
    $paymentIds: [String]
    $paymentTypes: JSON
    $propertyIds: [String]
  ) {
    salesPipelinesAdd(
      name: $name
      boardId: $boardId
      stages: $stages
      visibility: $visibility
      memberIds: $memberIds
      bgColor: $bgColor
      hackScoringType: $hackScoringType
      startDate: $startDate
      endDate: $endDate
      metric: $metric
      templateId: $templateId
      isCheckDate: $isCheckDate
      isCheckUser: $isCheckUser
      isCheckDepartment: $isCheckDepartment
      excludeCheckUserIds: $excludeCheckUserIds
      numberConfig: $numberConfig
      numberSize: $numberSize
      nameConfig: $nameConfig
      branchIds: $branchIds
      departmentIds: $departmentIds
      tagId: $tagId
      initialCategoryIds: $initialCategoryIds
      excludeCategoryIds: $excludeCategoryIds
      excludeProductIds: $excludeProductIds
      paymentIds: $paymentIds
      paymentTypes: $paymentTypes
      propertyIds: $propertyIds
    ) {
      _id
      name
    }
  }
`);

export const EDIT_PIPELINE = gql(`
  mutation salesPipelinesEdit(
    $_id: String!
    $name: String!
    $boardId: String!
    $stages: JSON
    $visibility: String!
    $memberIds: [String]
    $bgColor: String
    $startDate: Date
    $endDate: Date
    $metric: String
    $hackScoringType: String
    $templateId: String
    $isCheckDate: Boolean
    $isCheckUser: Boolean
    $isCheckDepartment: Boolean
    $excludeCheckUserIds: [String]
    $numberConfig: String
    $numberSize: String
    $nameConfig: String
    $departmentIds: [String]
    $branchIds: [String]
    $tagId: String
    $initialCategoryIds: [String]
    $excludeCategoryIds: [String]
    $excludeProductIds: [String]
    $paymentIds: [String]
    $paymentTypes: JSON
    $propertyIds: [String]
  ) {
    salesPipelinesEdit(
      _id: $_id
      name: $name
      boardId: $boardId
      stages: $stages
      visibility: $visibility
      memberIds: $memberIds
      bgColor: $bgColor
      hackScoringType: $hackScoringType
      startDate: $startDate
      endDate: $endDate
      metric: $metric
      templateId: $templateId
      isCheckDate: $isCheckDate
      isCheckUser: $isCheckUser
      isCheckDepartment: $isCheckDepartment
      excludeCheckUserIds: $excludeCheckUserIds
      numberConfig: $numberConfig
      numberSize: $numberSize
      nameConfig: $nameConfig
      branchIds: $branchIds
      departmentIds: $departmentIds
      tagId: $tagId
      initialCategoryIds: $initialCategoryIds
      excludeCategoryIds: $excludeCategoryIds
      excludeProductIds: $excludeProductIds
      paymentIds: $paymentIds
      paymentTypes: $paymentTypes
      propertyIds: $propertyIds
    ) {
      _id
      name
    }
  }
`);

export const REMOVE_PIPELINE = gql(`
  mutation salesPipelinesRemove($_id: String!) {
    salesPipelinesRemove(_id: $_id)
  }
`);
export const ARCHIVE_PIPELINE = gql(`
  mutation salesPipelinesArchive($_id: String!) {
    salesPipelinesArchive(_id: $_id)
  }
`);

export const COPY_PIPELINE = gql(`
  mutation salesPipelinesCopied($_id: String!) {
    salesPipelinesCopied(_id: $_id)
  }
`);
export const UPDATE_PIPELINE_ORDER = gql(`
  mutation salesPipelinesUpdateOrder($orders: [SalesOrderItem]) {
    salesPipelinesUpdateOrder(orders: $orders) {
      _id
    }
  }
`);
