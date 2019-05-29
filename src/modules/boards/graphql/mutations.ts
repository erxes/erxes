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
  dealsUpdateOrder: dealMutations.dealsUpdateOrder,
  dealsChange: dealMutations.dealsChange,

  ticketsAdd: ticketMutations.ticketsAdd,
  ticketsChange: ticketMutations.ticketsChange,
  ticketsUpdateOrder: ticketMutations.ticketsUpdateOrder,

  stagesUpdateOrder
};
