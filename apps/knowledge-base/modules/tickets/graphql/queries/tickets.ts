import { gql } from '@apollo/client';

const TICKET_FIELDS = `
  _id
  number
  name
  description
  priority
  createdAt
  updatedAt
  statusChangedDate
  status {
    _id
    name
    color
    type
  }
`;

export const TICKET_PORTAL_LIST = gql`
  query ticketPortalList($filter: ICpTicketFilter) {
    cpGetTickets(filter: $filter) {
      ${TICKET_FIELDS}
    }
  }
`;

export const TICKET_PORTAL_DETAIL = gql`
  query ticketPortalDetail($_id: String!) {
    cpGetTicket(_id: $_id) {
      ${TICKET_FIELDS}
    }
  }
`;

export const TICKET_PORTAL_NOTES = gql`
  query ticketPortalNotes($ticketId: String!) {
    cpTicketGetNotes(ticketId: $ticketId) {
      _id
      content
      createdAt
      createdBy
    }
  }
`;
