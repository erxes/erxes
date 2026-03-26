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
    $name: String
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
      name: $name
    ) {
      list {
        _id
        branchId
        name
        duration
        color
        images
        guideCost
        driverCost
        foodCost
        gasCost
        personCost
        guideCostExtra
        totalCost
        createdAt
        modifiedAt
        content
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
      images
      content
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
