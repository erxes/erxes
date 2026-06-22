import { gql } from '@apollo/client';

export const MOVE_DEAL = gql`
  mutation DealsChange(
    $itemId: String!
    $destinationStageId: String!
    $sourceStageId: String!
    $processId: String!
  ) {
    dealsChange(
      itemId: $itemId
      destinationStageId: $destinationStageId
      sourceStageId: $sourceStageId
      processId: $processId
    ) {
      _id
      stageId
    }
  }
`;

export const SAVE_WIDGET = gql`
  mutation SaveWidget($widget: SavedWidgetInput!) {
    saveWidget(widget: $widget) {
      _id
      name
      chartType
      filters
      position
    }
  }
`;

export const UPDATE_WIDGET = gql`
  mutation UpdateWidget($_id: String!, $widget: SavedWidgetInput!) {
    updateWidget(_id: $_id, widget: $widget) {
      _id
      name
      chartType
      filters
      position
    }
  }
`;

export const DELETE_WIDGET = gql`
  mutation DeleteWidget($_id: String!) {
    deleteWidget(_id: $_id)
  }
`;