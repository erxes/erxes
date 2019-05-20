const ticketFields = `
  _id
  name
  stageId
  boardId
  closeDate
  description
  modifiedAt
  modifiedBy
`;

const tickets = `
  query tickets($stageId: String) {
    tickets(stageId: $stageId) {
      ${ticketFields}
    }
  }
`;

const ticketDetail = `
  query ticketDetail($_id: String!) {
    ticketDetail(_id: $_id) {
      ${ticketFields}
    }
  }
`;

export default {
  tickets,
  ticketDetail
};
