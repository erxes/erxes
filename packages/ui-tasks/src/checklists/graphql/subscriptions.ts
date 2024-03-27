const taskChecklistsChanged = `
  subscription taskChecklistsChanged($contentType: String!, $contentTypeId: String!) {
    taskChecklistsChanged(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
    }
  }
`;

const taskChecklistDetailChanged = `
  subscription taskChecklistDetailChanged($_id: String!) {
    taskChecklistDetailChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  taskChecklistsChanged,
  taskChecklistDetailChanged,
};
