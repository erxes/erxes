const checklistsChanged = `
  subscription purchasesChecklistDetailChanged($contentType: String!, $contentTypeId: String!) {
    purchasesChecklistDetailChanged(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
    }
  }
`;

const checklistDetailChanged = `
  subscription purchasesChecklistDetailChanged($_id: String!) {
    purchasesChecklistDetailChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  checklistsChanged,
  checklistDetailChanged
};
