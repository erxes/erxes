import gql from "graphql-tag";

export const UPDATE_STAGES_ORDER = gql`
  mutation salesStagesUpdateOrder($orders: [SalesOrderItem]) {
    salesStagesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;