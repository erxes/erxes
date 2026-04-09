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
    $language: String
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
      language: $language
    ) {
      list {
        _id
        branchId
        language
        name
        duration
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
        color
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
        translations {
          _id
          language
          name
          content
          foodCost
          gasCost
          driverCost
          guideCost
          guideCostExtra
          groupDays {
            day
            title
            content
          }
        }
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
  query BmsItineraryDetail($id: String!, $language: String) {
    bmsItineraryDetail(_id: $id, language: $language) {
      _id
      branchId
      language
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
      color
      translations {
        _id
        language
        name
        content
        foodCost
        gasCost
        driverCost
        guideCost
        guideCostExtra
        groupDays {
          day
          title
          content
        }
      }
    }
  }
`;

export const GET_ITINERARY_PDF_TEMPLATE = gql`
  query BmsItineraryPdfTemplateDetail($itineraryId: String!, $kind: String) {
    bmsItineraryPdfTemplateDetail(itineraryId: $itineraryId, kind: $kind) {
      _id
      itineraryId
      branchId
      kind
      name
      description
      status
      version
      doc
      createdAt
      modifiedAt
      createdBy
      modifiedBy
    }
  }
`;
