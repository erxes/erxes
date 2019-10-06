import { toArray } from 'modules/boards/utils';
import PortableTicket from 'modules/tickets/components/PortableTicket';
import TicketEditForm from 'modules/tickets/components/TicketEditForm';
import TicketItem from './components/TicketItem';
import { mutations, queries } from './graphql';

const options = {
  EditForm: TicketEditForm,
  PortableItem: PortableTicket,
  Item: TicketItem,
  type: 'ticket',
  title: 'Ticket',
  queriesName: {
    itemsQuery: 'tickets',
    detailQuery: 'ticketDetail'
  },
  mutationsName: {
    addMutation: 'ticketsAdd',
    editMutation: 'ticketsEdit',
    removeMutation: 'ticketsRemove',
    changeMutation: 'ticketsChange',
    updateOrderMutation: 'ticketsUpdateOrder',
    watchMutation: 'ticketsWatch'
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
    updateOrderMutation: mutations.ticketsUpdateOrder,
    watchMutation: mutations.ticketsWatch
  },
  texts: {
    addText: 'Add a ticket',
    addSuccessText: 'You successfully added a ticket',
    updateSuccessText: 'You successfully updated a ticket',
    deleteSuccessText: 'You successfully deleted a ticket',
    copySuccessText: 'You successfully copied a ticket',
    changeSuccessText: 'You successfully changed a ticket'
  },
  isMove: true,
  getExtraParams: (queryParams: any) => {
    const { priority, source } = queryParams;
    const extraParams: any = {};

    if (priority) {
      extraParams.priority = toArray(priority);
    }

    if (source) {
      extraParams.source = toArray(source);
    }

    return extraParams;
  }
};

export default options;
