const checklistsChanged = `
  subscription purchaseChecklistsChanged($contentType: String!, $contentTypeId: String!) {
    purchaseChecklistsChanged(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
    }
  }
`;

const checklistDetailChanged = `
  subscription purchaseChecklistDetailChanged($_id: String!) {
    purchaseChecklistDetailChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  checklistsChanged,
  checklistDetailChanged
};
