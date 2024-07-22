const checklistsChanged = `
  subscription ticketsChecklistDetailChanged($contentType: String!, $contentTypeId: String!) {
    ticketsChecklistDetailChanged(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
    }
  }
`;

const checklistDetailChanged = `
  subscription ticketsChecklistDetailChanged($_id: String!) {
    ticketsChecklistDetailChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  checklistsChanged,
  checklistDetailChanged
};
