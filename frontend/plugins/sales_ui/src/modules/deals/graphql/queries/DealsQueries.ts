import { gql } from '@apollo/client';

const commonParams = `
  $_ids: [String]
  $companyIds: [String],
  $customerIds: [String],
  $assignedUserIds: [String],
  $productIds: [String],
  $labelIds: [String],
  $search: String,
  $priority: [String],
  $date: SalesItemDate,
  $pipelineId: String,
  $parentId: String,
  $closeDateType: String,
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
  createdStartDate: $createdStartDate,
  createdEndDate: $createdEndDate,
  stateChangedStartDate: $stateChangedStartDate
  stateChangedEndDate: $stateChangedEndDate
  startDateStartDate: $startDateStartDate
  startDateEndDate: $startDateEndDate
  closeDateStartDate: $closeDateStartDate
  closeDateEndDate: $closeDateEndDate
`;

export const commonListFields = `
  _id
  name
  companies {
    _id
    primaryName
    primaryPhone
    primaryEmail
  }
  customers {
    _id
    firstName
    middleName
    lastName
    primaryPhone
    primaryEmail
    phones
    emails
  }
  assignedUsers {
    _id
    details {
      avatar
      fullName
    }
  }
  assignedUserIds
  labels {
    _id
    name
    colorCode
  }
  stage {
    _id
    name
    defaultTick
    age
  }
  stageId
  order
  isComplete
  isWatched
  relations
  startDate
  closeDate
  createdAt
  modifiedAt
  priority
  hasNotified
  score
  number
  tagIds
  customProperties
  propertiesData
  status
  tags {
    _id
    name
    colorCode
  }
  branchIds
  departmentIds
`;

export const GET_DEALS = gql`
  query Deals(
    $initialStageId: String,
    $stageId: String,
    $limit: Int, 
    $cursor: String, 
    $cursorMode: CURSOR_MODE,
    $orderBy: JSON,
    ${commonParams}
  ) {
    deals(
      initialStageId: $initialStageId,
      stageId: $stageId,
      limit: $limit, 
      cursor: $cursor, 
      cursorMode: $cursorMode,
      orderBy: $orderBy, 
      ${commonParamDefs}
    ) {
        list {
          products {
            _id
            name
          }
          productsData
          unUsedAmount
          amount
          ${commonListFields}
          departments {
            _id
            title
          }
          branches {
            _id
            title
          }
          relations
          pipeline {
            _id
            name
          }
          boardId
        }
        pageInfo {
          endCursor
          startCursor
          hasNextPage
          hasPreviousPage
        }
       
        totalCount
      }
  }
`;

export const GET_DEAL_DETAIL = gql`
  query DealDetail($_id: String!) {
    dealDetail(_id: $_id) {
      ${commonListFields}
      description
      attachments {
        url
        name
        duration
        size  
        type
      }
      departments {
        _id
        title
      }
      departmentIds
      branches {
        _id
        title
      }
      branchIds
      companies {
        _id
        primaryName
      }
      customers {
        _id
        firstName
        lastName
        email
      }
      products {
        _id
        name
        code
        unitPrice
        category {
          _id
          name
        }
        vendor {
          _id
          primaryName
        }
        categoryId
      }
      productsData
      paymentsData
      relations
      pipeline {
        _id
        name
        paymentTypes
        paymentIds
      }
      boardId
    }
  }
`;

export const GET_ITEMS_COUNT_BY_SEGMENTS = gql`
  query SalesItemsCountBySegments(
    $type: String!
    $boardId: String
    $pipelineId: String
  ) {
    salesItemsCountBySegments(
      type: $type
      boardId: $boardId
      pipelineId: $pipelineId
    )
  }
`;

export const GET_ITEMS_COUNT_BY_ASSIGNED_USER = gql`
  query SalesItemsCountByAssignedUser(
    $pipelineId: String!
    $type: String!
    $stackBy: String
  ) {
    salesItemsCountByAssignedUser(
      pipelineId: $pipelineId
      type: $type
      stackBy: $stackBy
    )
  }
`;
