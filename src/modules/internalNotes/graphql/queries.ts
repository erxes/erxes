const internalNoteDetail = `
  query internalNoteDetail($_id: String!) {
    internalNoteDetail(_id: $_id) {
      _id
      content
    }
  }
`;

export default {
  internalNoteDetail
};
