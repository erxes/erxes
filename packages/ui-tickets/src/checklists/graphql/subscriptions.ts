const checklistsChanged = `
  subscription ticketChecklistsChanged($contentType: String!, $contentTypeId: String!) {
    ticketChecklistsChanged(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
    }
  }
`;

const checklistDetailChanged = `
  subscription ticketChecklistDetailChanged($_id: String!) {
    ticketChecklistDetailChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  checklistsChanged,
  checklistDetailChanged,
};
