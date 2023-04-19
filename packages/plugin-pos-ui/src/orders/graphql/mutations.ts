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
  mutation posOrderChangePayments($_id: String!, $cashAmount: Float, $mobileAmount: Float, $paidAmounts: JSON) {
    posOrderChangePayments(_id: $_id, cashAmount: $cashAmount, mobileAmount: $mobileAmount, paidAmounts: $paidAmounts){
      ${orderFields}
    }
  }
`;

const coversEdit = `
  mutation posCoversEdit($_id: String!, $note: String) {
    posCoversEdit(_id: $_id, note: $note) {
      ${orderFields}
    }
  }
`;

const coversRemove = `
  mutation posCoversRemove($_id: String!) {
    posCoversRemove(_id: $_id) 
  }
`;

export default {
  posOrderSyncErkhet,
  posOrderReturnBill,
  posOrderChangePayments,
  coversEdit,
  coversRemove
};
