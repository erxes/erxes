import { orderFields } from './queries';

const posOrderSyncErkhet = `
  mutation posOrderSyncErkhet($_id: String!) {
    posOrderSyncErkhet(_id: $_id){
      ${orderFields}
    }
  }
`;

const posOrderReturnBill = `
  mutation posOrderReturnBill($_id: String!) {
    posOrderReturnBill(_id: $_id){
      ${orderFields}
    }
  }
`;

const posOrderChangePayments = `
  mutation posOrderChangePayments($_id: String!, $cashAmount: Float, $cardAmount: Float, $mobileAmount: Float) {
    posOrderChangePayments(_id: $_id, cashAmount: $cashAmount, cardAmount: $cardAmount, mobileAmount: $mobileAmount){
      ${orderFields}
    }
  }
`;
export default {
  posOrderSyncErkhet,
  posOrderReturnBill,
  posOrderChangePayments
};
