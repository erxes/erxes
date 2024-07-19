const checklistsChanged = `
  subscription salesChecklistsChanged($contentType: String!, $contentTypeId: String!) {
    salesChecklistsChanged(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
    }
  }
`;

const checklistDetailChanged = `
  subscription salesChecklistDetailChanged($_id: String!) {
    salesChecklistDetailChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  checklistsChanged,
  checklistDetailChanged
};
