import { mutations as dealMutations } from 'modules/deals/graphql';
import { mutations as ticketMutations } from 'modules/tickets/graphql';

const stagesUpdateOrder = `
  mutation stagesUpdateOrder($orders: [OrderItem]) {
    stagesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

export default {
  dealsAdd: dealMutations.dealsAdd,
  dealsEdit: dealMutations.dealsEdit,
  dealsRemove: dealMutations.dealsRemove,
  dealsUpdateOrder: dealMutations.dealsUpdateOrder,
  dealsChange: dealMutations.dealsChange,

  ticketsAdd: ticketMutations.ticketsAdd,
  ticketsEdit: ticketMutations.ticketsEdit,
  ticketsRemove: ticketMutations.ticketsRemove,
  ticketsChange: ticketMutations.ticketsChange,
  ticketsUpdateOrder: ticketMutations.ticketsUpdateOrder,

  stagesUpdateOrder
};
