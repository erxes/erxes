const internalNoteDetail = `
  query internalNoteDetail($_id: String!) {
    internalNoteDetail(_id: $_id) {
      _id
      content
      createdAt

      createdUser {
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
