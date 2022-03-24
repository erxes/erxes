import { orderFields } from "./queries";

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

export default {
  posOrderSyncErkhet,
  posOrderReturnBill
};
