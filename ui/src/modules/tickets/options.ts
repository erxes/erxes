import { toArray } from 'modules/boards/utils';
import TicketEditForm from 'modules/tickets/components/TicketEditForm';
import TicketItem from './components/TicketItem';
import { mutations, queries, subscriptions } from './graphql';

const options = {
  EditForm: TicketEditForm,
  Item: TicketItem,
  type: 'ticket',
  title: 'Ticket',
  queriesName: {
    itemsQuery: 'tickets',
    detailQuery: 'ticketDetail',
    archivedItemsQuery: 'archivedTickets',
    archivedItemsCountQuery: 'archivedTicketsCount'
  },
  mutationsName: {
    addMutation: 'ticketsAdd',
    editMutation: 'ticketsEdit',
    removeMutation: 'ticketsRemove',
    changeMutation: 'ticketsChange',
    updateOrderMutation: 'ticketsUpdateOrder',
    watchMutation: 'ticketsWatch',
    archiveMutation: 'ticketsArchive',
    copyMutation: 'ticketsCopy'
  },
  subscriptionName: {
    changeSubscription: 'ticketsChanged',
    moveSubscription: 'ticketsMoved'
  },
  queries: {
    itemsQuery: queries.tickets,
    detailQuery: queries.ticketDetail,
    archivedItemsQuery: queries.archivedTickets,
    archivedItemsCountQuery: queries.archivedTicketsCount
  },
  mutations: {
    addMutation: mutations.ticketsAdd,
    editMutation: mutations.ticketsEdit,
    removeMutation: mutations.ticketsRemove,
    changeMutation: mutations.ticketsChange,
    updateOrderMutation: mutations.ticketsUpdateOrder,
    watchMutation: mutations.ticketsWatch,
    archiveMutation: mutations.ticketsArchive,
    copyMutation: mutations.ticketsCopy
  },
  subscriptions: {
    changeSubscription: subscriptions.ticketsChanged,
    moveSubscription: subscriptions.ticketsMoved
  },
  texts: {
    addText: 'Add a ticket',
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
