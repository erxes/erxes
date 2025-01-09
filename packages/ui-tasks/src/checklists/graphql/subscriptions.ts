const checklistsChanged = `
  subscription tasksChecklistDetailChanged($contentType: String!, $contentTypeId: String!) {
    tasksChecklistDetailChanged(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
    }
  }
`;

const checklistDetailChanged = `
  subscription tasksChecklistDetailChanged($_id: String!) {
    tasksChecklistDetailChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  checklistsChanged,
  checklistDetailChanged
};
