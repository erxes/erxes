const internalNotesAdd = `
  mutation internalNotesAdd(
    $contentType: String!,
    $contentTypeId: String,
    $content: String,
    $mentionedUserIds: [String]
  ) {
      internalNotesAdd(
        contentType: $contentType,
        contentTypeId: $contentTypeId,
        content: $content,
        mentionedUserIds: $mentionedUserIds,
      ) {
        _id
        content
        createdAt
      }
  }
`;

const internalNotesEdit = `
  mutation internalNotesEdit(
    $_id: String!,
    $content: String,
    $mentionedUserIds: [String]
  ) {
    internalNotesEdit(
        _id: $_id,
        content: $content,
        mentionedUserIds: $mentionedUserIds,
      ) {
        _id
        content
        createdAt
      }
  }
`;

const internalNotesRemove = `
  mutation internalNotesRemove($_id: String!) {
    internalNotesRemove(_id: $_id) {
      _id
    }
  }
`;

export default {
  internalNotesAdd,
  internalNotesEdit,
  internalNotesRemove
};
