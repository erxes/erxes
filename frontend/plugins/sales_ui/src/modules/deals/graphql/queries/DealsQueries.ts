import { gql } from '~/gql';

export const GET_DEALS_SEARCH_DROPDOWN = gql(`
  query salesDealSearchDropdown(
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $_ids: [String]
    $companyId: String
    $customerId: String
    $assignedUserIds: [String]
    $productIds: [String]
    $labelIds: [String]
    $search: String
    $number: String
    $priority: [String]
    $date: SalesItemDate
    $pipelineId: String
    $parentId: String
    $closeDateType: String
    $userIds: [String]
    $segment: String
    $assignedToMe: String
    $startDate: String
    $endDate: String
    $tagIds: [String]
    $noSkipArchive: Boolean
    $status: String
    $branchIds: [String]
    $departmentIds: [String]
    $createdStartDate: Date
    $createdEndDate: Date
    $stageChangedStartDate: Date
    $stageChangedEndDate: Date
    $startDateStartDate: Date
    $startDateEndDate: Date
    $closeDateStartDate: Date
    $closeDateEndDate: Date
  ) {
    deals(
      limit: $limit
      orderBy: $orderBy
      cursor: $cursor
      direction: $direction
      _ids: $_ids
      companyId: $companyId
      customerId: $customerId
      assignedUserIds: $assignedUserIds
      priority: $priority
      productIds: $productIds
      labelIds: $labelIds
      search: $search
      number: $number
      date: $date
      pipelineId: $pipelineId
      parentId: $parentId
      closeDateType: $closeDateType
      userIds: $userIds
      segment: $segment
      assignedToMe: $assignedToMe
      startDate: $startDate
      endDate: $endDate
      tagIds: $tagIds
      noSkipArchive: $noSkipArchive
      status: $status
      branchIds: $branchIds
      departmentIds: $departmentIds
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      stageChangedStartDate: $stageChangedStartDate
      stageChangedEndDate: $stageChangedEndDate
      startDateStartDate: $startDateStartDate
      startDateEndDate: $startDateEndDate
      closeDateStartDate: $closeDateStartDate
      closeDateEndDate: $closeDateEndDate
    ) {
      list {
        _id
        name
        number
        createdAt
        status
        pipeline {
          _id
          name
          boardId
        }
        boardId
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`);

export const GET_DEALS = gql(`
  query salesDealList(
    $initialStageId: String
    $stageId: String
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $_ids: [String]
    $companyId: String
    $customerId: String
    $assignedUserIds: [String]
    $productIds: [String]
    $labelIds: [String]
    $search: String
    $number: String
    $priority: [String]
    $date: SalesItemDate
    $pipelineId: String
    $parentId: String
    $closeDateType: String
    $userIds: [String]
    $segment: String
    $assignedToMe: String
    $startDate: String
    $endDate: String
    $tagIds: [String]
    $noSkipArchive: Boolean
    $status: String
    $branchIds: [String]
    $departmentIds: [String]
    $createdStartDate: Date
    $createdEndDate: Date
    $stageChangedStartDate: Date
    $stageChangedEndDate: Date
    $startDateStartDate: Date
    $startDateEndDate: Date
    $closeDateStartDate: Date
    $closeDateEndDate: Date
  ) {
    deals(
      initialStageId: $initialStageId
      stageId: $stageId
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      _ids: $_ids
      companyId: $companyId
      customerId: $customerId
      assignedUserIds: $assignedUserIds
      priority: $priority
      productIds: $productIds
      labelIds: $labelIds
      search: $search
      number: $number
      date: $date
      pipelineId: $pipelineId
      parentId: $parentId
      closeDateType: $closeDateType
      userIds: $userIds
      segment: $segment
      assignedToMe: $assignedToMe
      startDate: $startDate
      endDate: $endDate
      tagIds: $tagIds
      noSkipArchive: $noSkipArchive
      status: $status
      branchIds: $branchIds
      departmentIds: $departmentIds
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      stageChangedStartDate: $stageChangedStartDate
      stageChangedEndDate: $stageChangedEndDate
      startDateStartDate: $startDateStartDate
      startDateEndDate: $startDateEndDate
      closeDateStartDate: $closeDateStartDate
      closeDateEndDate: $closeDateEndDate
    ) {
      list {
        products {
          _id
          name
        }
        productsData
        unUsedAmount
        amount
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
          pipelineId
          defaultTick
          age
        }
        stageId
        pipelineId
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
          boardId
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
`);

export const GET_DEAL_DETAIL = gql(`
  query DealDetail($_id: String!) {
    dealDetail(_id: $_id) {
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
        pipelineId
        defaultTick
        age
      }
      stageId
      pipelineId
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
      description
      extraData
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
        type
        unitPrice
        uom
        subUoms
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
      mobileAmount
      mobileAmounts
      paymentsData
      brokerType
      brokerId
      relations
      pipeline {
        _id
        name
        boardId
        paymentTypes
        paymentIds
      }
      boardId
    }
  }
`);

export const GET_ITEMS_COUNT_BY_ASSIGNED_USER = gql(`
  query SalesItemsCountByAssignedUser(
    $pipelineId: String!
    $stackBy: String
  ) {
    salesItemsCountByAssignedUser(
      pipelineId: $pipelineId
      stackBy: $stackBy
    )
  }
`);
