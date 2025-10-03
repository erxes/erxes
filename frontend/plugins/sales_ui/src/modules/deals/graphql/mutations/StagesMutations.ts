import gql from "graphql-tag";

export const UPDATE_STAGES_ORDER = gql`
  mutation salesStagesUpdateOrder($orders: [SalesOrderItem]) {
    salesStagesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

export const STAGES_EDIT = gql`
  mutation salesStagesEdit($_id: String!, $name: String, $status: String) {
    salesStagesEdit(_id: $_id, name: $name, status: $status) {
      _id
    }
  }
`;

export const STAGES_REMOVE = gql`
  mutation salesStagesRemove($_id: String!) {
    salesStagesRemove(_id: $_id)
  }
`;

export const STAGES_SORT_ITEMS = gql`
  mutation salesStagesSortItems($stageId: String!, $processId: String, $sortType: String) {
    salesStagesSortItems(stageId: $stageId, processId: $processId, sortType: $sortType)
  }
`;
