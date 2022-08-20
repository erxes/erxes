const checklistsChanged = `
  subscription checklistsChanged($contentType: String!, $contentTypeId: String!) {
    checklistsChanged(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
    }
  }
`;

const checklistDetailChanged = `
  subscription checklistDetailChanged($_id: String!) {
    checklistDetailChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  checklistsChanged,
  checklistDetailChanged
};
