import messageFields from './messageFields';

const conversationMessageAdd = `
  mutation conversationMessageAdd(
    $conversationId: String,
    $content: String,
    $mentionedUserIds: [String],
    $internal: Boolean,
    $attachments: [AttachmentInput],
    $tweetReplyToId: String,
    $tweetReplyToScreenName: String
    $commentReplyToId: String
  ) {
    conversationMessageAdd(
      conversationId: $conversationId,
      content: $content,
      mentionedUserIds: $mentionedUserIds,
      internal: $internal,
      attachments: $attachments,
      tweetReplyToId: $tweetReplyToId,
      tweetReplyToScreenName: $tweetReplyToScreenName
      commentReplyToId: $commentReplyToId
    ) {
      ${messageFields}
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

const favoriteTweet = `
  mutation conversationsFavorite(
    $integrationId: String,
    $id: String
  ) {
    conversationsFavorite(
      integrationId: $integrationId,
      id: $id,
    )
  }
`;

const retweetTweet = `
  mutation conversationsRetweet(
    $integrationId: String,
    $id: String
  ) {
    conversationsRetweet(
      integrationId: $integrationId,
      id: $id,
    )
  }
`;

const tweet = `
  mutation conversationsTweet(
    $integrationId: String,
    $text: String
  ) {
    conversationsTweet(
      integrationId: $integrationId,
      text: $text
    )
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

const conversationsAssign = `
  mutation conversationsAssign($conversationIds: [String]!, $assignedUserId: String) {
    conversationsAssign(conversationIds: $conversationIds, assignedUserId: $assignedUserId) {
      _id
    }
  }
`;

const conversationsUnassign = `
  mutation conversationsUnassign($_ids: [String]!) {
    conversationsUnassign(_ids: $_ids) {
      _id
    }
  }
`;

const executeApp = `
  mutation messengerAppsExecuteGoogleMeet($_id: String!, $conversationId: String!) {
    messengerAppsExecuteGoogleMeet(_id: $_id, conversationId: $conversationId) {
      _id
    }
  }
`;

export default {
  conversationMessageAdd,
  conversationsChangeStatus,
  conversationsAssign,
  conversationsUnassign,
  saveResponseTemplate,
  markAsRead,
  favoriteTweet,
  retweetTweet,
  tweet,
  executeApp
};
