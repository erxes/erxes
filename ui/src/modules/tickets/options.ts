import { toArray } from 'modules/boards/utils';
import TicketEditForm from 'modules/tickets/components/TicketEditForm';
import TicketItem from './components/TicketItem';
import { mutations, queries } from './graphql';

const options = {
  EditForm: TicketEditForm,
  Item: TicketItem,
  type: 'ticket',
  title: 'Ticket',
  queriesName: {
    itemsQuery: 'tickets',
    itemsTotalCountQuery: 'ticketsTotalCount',
    detailQuery: 'ticketDetail',
    archivedItemsQuery: 'archivedTickets',
    archivedItemsCountQuery: 'archivedTicketsCount'
  },
  mutationsName: {
    addMutation: 'ticketsAdd',
    editMutation: 'ticketsEdit',
    removeMutation: 'ticketsRemove',
    changeMutation: 'ticketsChange',
    watchMutation: 'ticketsWatch',
    archiveMutation: 'ticketsArchive',
    copyMutation: 'ticketsCopy'
  },
  queries: {
    itemsQuery: queries.tickets,
    itemsTotalCountQuery: queries.ticketsTotalCount,
    detailQuery: queries.ticketDetail,
    archivedItemsQuery: queries.archivedTickets,
    archivedItemsCountQuery: queries.archivedTicketsCount
  },
  mutations: {
    addMutation: mutations.ticketsAdd,
    editMutation: mutations.ticketsEdit,
    removeMutation: mutations.ticketsRemove,
    changeMutation: mutations.ticketsChange,
    watchMutation: mutations.ticketsWatch,
    archiveMutation: mutations.ticketsArchive,
    copyMutation: mutations.ticketsCopy
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
