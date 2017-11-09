const conversationMessageAdd = `
  mutation conversationMessageAdd(
    $conversationId: String!,
    $content: String!,
    $mentionedUserIds: [String],
    $internal: Boolean,
    $attachments: [String]
  ) {
    conversationMessageAdd(
      conversationId: $conversationId,
      content: $content,
      mentionedUserIds: $mentionedUserIds,
      internal: $internal,
      attachments: $attachments
    ) {
      _id
      content
    }
  }
`;

export default {
  conversationMessageAdd
};
