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

const markAsRead = `
  mutation conversationMarkAsRead(
    $_id: String
  ) {
    conversationMarkAsRead(
      _id: $_id,
    ) {
      _id
    }
  }
`;

const saveResponseTemplate = `
  mutation responseTemplatesAdd(
    $brandId: String!,
    $name: String!,
    $content: String,
    $files: JSON
  ) {
    responseTemplatesAdd(
      brandId: $brandId,
      name: $name,
      content: $content,
      files: $files
    ) {
      _id
      name
    }
  }
`;

const conversationsChangeStatus = `
  mutation conversationsChangeStatus($_ids: [String]!, $status: String!) {
    conversationsChangeStatus(_ids: $_ids, status: $status) {
      _id
    }
  }
`;

export default {
  conversationMessageAdd,
  conversationsChangeStatus,
  saveResponseTemplate,
  markAsRead
};
