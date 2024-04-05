const dealsChecklistsChanged = `
  subscription dealsChecklistsChanged($contentType: String!, $contentTypeId: String!) {
    dealsChecklistsChanged(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
    }
  }
`;

const dealsChecklistDetailChanged = `
  subscription dealsChecklistDetailChanged($_id: String!) {
    dealsChecklistDetailChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  dealsChecklistsChanged,
  dealsChecklistDetailChanged,
};
