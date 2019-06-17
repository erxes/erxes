import { PortableTicket, TicketEditForm } from 'modules/tickets/components';
import { TicketItem } from './containers/';
import { mutations, queries } from './graphql';

const options = {
  EditForm: TicketEditForm,
  PortableItem: PortableTicket,
  Item: TicketItem,
  type: 'ticket',
  title: 'Tickets',
  queriesName: {
    itemsQuery: 'tickets',
    detailQuery: 'ticketDetail'
  },
  mutationsName: {
    addMutation: 'ticketsAdd',
    editMutation: 'ticketsEdit',
    removeMutation: 'ticketsRemove',
    changeMutation: 'ticketsChange',
    updateOrderMutation: 'ticketsUpdateOrder'
  },
  queries: {
    itemsQuery: queries.tickets,
    detailQuery: queries.ticketDetail
  },
  mutations: {
    addMutation: mutations.ticketsAdd,
    editMutation: mutations.ticketsEdit,
    removeMutation: mutations.ticketsRemove,
    changeMutation: mutations.ticketsChange,
    updateOrderMutation: mutations.ticketsUpdateOrder
  },
  texts: {
    addText: 'Add a ticket',
    addSuccessText: 'You successfully added a ticket',
    updateSuccessText: 'You successfully updated a ticket',
    deleteSuccessText: 'You successfully deleted a ticket',
    copySuccessText: 'You successfully copied a ticket'
  }
};

export default options;
