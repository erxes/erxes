import { gql } from '@apollo/client';

export const GET_TOURS = gql`
  query BmsTours(
    $branchId: String
    $status: String
    $date_status: DATE_STATUS
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
  ) {
    bmsTours(
      branchId: $branchId
      status: $status
      date_status: $date_status
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
    ) {
      list {
        _id
        name
        refNumber
        groupCode
        startDate
        endDate
        status
        date_status
        cost
        modifiedAt
        createdAt
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

export const GET_TOUR_GROUPS = gql`
  query BmToursGroup(
    $branchId: String
    $status: String
    $date_status: DATE_STATUS
  ) {
    bmToursGroup(
      branchId: $branchId
      status: $status
      date_status: $date_status
    ) {
      total
      list {
        _id
        items {
          _id
          name
          refNumber
          groupCode
          startDate
          endDate
          status
          date_status
          cost
          modifiedAt
          createdAt
        }
      }
    }
  }
`;

export const GET_TOUR_DETAIL = gql`
  query BmsTourDetail($id: String!) {
    bmsTourDetail(_id: $id) {
      _id
      advanceCheck
      advancePercent
      content
      cost
      date_status
      duration
      endDate
      groupSize
      imageThumbnail
      images
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
    }
  }
`;
