import { gql } from '@apollo/client';

export const GET_TOURS = gql`
  query BmsTours(
    $branchId: String
    $name: String
    $status: String
    $date_status: DATE_STATUS
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
    $categoryIds: [String]
    $language: String
  ) {
    bmsTours(
      branchId: $branchId
      name: $name
      status: $status
      date_status: $date_status
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
      categoryIds: $categoryIds
      language: $language
    ) {
      list {
        _id
        name
        refNumber
        groupCode
        dateType
        startDate
        endDate
        availableFrom
        availableTo
        status
        date_status
        cost
        categoryIds
        modifiedAt
        createdAt
        categoryIds
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_TOUR_ORDER_DETAIL = gql`
  query BmsOrderDetail($id: String!) {
    bmsOrderDetail(_id: $id) {
      _id
      branchId
      customerId
      tourId
      amount
      status
      note
      internalNote
      numberOfPeople
      type
      additionalCustomers
      isChild
      parent
      createdAt
    }
  }
`;

export const GET_TOUR_GROUPS = gql`
  query BmToursGroup(
    $branchId: String
    $status: String
    $date_status: DATE_STATUS
    $categoryIds: [String]
    $language: String
  ) {
    bmToursGroup(
      branchId: $branchId
      status: $status
      date_status: $date_status
      categoryIds: $categoryIds
      language: $language
    ) {
      total
      list {
        _id
        name
        items {
          _id
          name
          refNumber
          groupCode
          dateType
          startDate
          endDate
          availableFrom
          availableTo
          status
          date_status
          cost
          modifiedAt
          createdAt
          categoryIds
        }
      }
    }
  }
`;

export const GET_TOUR_DETAIL = gql`
  query BmsTourDetail($id: String!, $language: String) {
    bmsTourDetail(_id: $id, language: $language) {
      _id
      branchId
      language
      advanceCheck
      advancePercent
      categoryIds
      content
      cost
      date_status
      dateType
      duration
      endDate
      availableFrom
      availableTo
      groupSize
      imageThumbnail
      images
      attachment {
        url
        name
        type
        size
      }
      info1
      info2
      info3
      info4
      info5
      itineraryId
      joinPercent
      name
      personCost
      refNumber
      startDate
      status
      categoryIds
      pricingOptions {
        _id
        title
        minPersons
        maxPersons
        prices {
          type
          price
        }
        pricePerPerson
        accommodationType
        domesticFlightPerPerson
        singleSupplement
        note
      }
      translations {
        _id
        objectId
        language
        name
        refNumber
        content
        info1
        info2
        info3
        info4
        info5
        pricingOptions {
          optionId
          title
          accommodationType
          note
          prices {
            type
            price
          }
          pricePerPerson
          domesticFlightPerPerson
          singleSupplement
        }
      }
      createdAt
      modifiedAt
    }
  }
`;

export const GET_TOUR_ORDERS = gql`
  query BmsOrders(
    $tourId: String
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
    $direction: CURSOR_DIRECTION
    $cursorMode: CURSOR_MODE
    $cursor: String
    $limit: Int
  ) {
    bmsOrders(
      tourId: $tourId
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
      direction: $direction
      cursorMode: $cursorMode
      cursor: $cursor
      limit: $limit
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      list {
        _id
        branchId
        customerId
        tourId
        amount
        status
        note
        internalNote
        numberOfPeople
        type
        additionalCustomers
        isChild
        parent
        createdAt
      }
    }
  }
`;

export const GET_TOUR_ORDER_CUSTOMER_IDS = gql`
  query BmsOrderCustomerIds($tourId: String!) {
    bmsOrderCustomerIds(tourId: $tourId)
  }
`;
