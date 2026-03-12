import { gql } from '@apollo/client';

export const GET_ITINERARIES = gql`
  query BmsItineraries(
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
    $branchId: String
  ) {
    bmsItineraries(
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
      branchId: $branchId
    ) {
      list {
        _id
        branchId
        name
        duration
        color
        guideCost
        driverCost
        foodCost
        gasCost
        personCost
        guideCostExtra
        createdAt
        modifiedAt
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_ITINERARY_DETAIL = gql`
  query BmsItineraryDetail($id: String!) {
    bmsItineraryDetail(_id: $id) {
      _id
      branchId
      name
      duration
      totalCost
      groupDays {
        content
        day
        elements {
          elementId
          orderOfDay
        }
        elementsQuick {
          elementId
          orderOfDay
        }
        images
        title
      }
      color
      foodCost
      personCost
      gasCost
      driverCost
      guideCost
      guideCostExtra
      createdAt
      modifiedAt
    }
  }
`;
