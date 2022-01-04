const internalNoteDetail = `
  query internalNoteDetail($_id: String!) {
    internalNoteDetail(_id: $_id) {
      _id
      content
      createdAt

      createdUser {
        _id
        details {
          avatar 
          fullName
        }
      }
    }
  }
`;

export default {
  internalNoteDetail
};
