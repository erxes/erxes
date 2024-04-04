const facebookUpdateConfigs = `
  mutation facebookUpdateConfigs($configsMap: JSON!) {
    facebookUpdateConfigs(configsMap: $configsMap)
  }
`;

const facebookRepair = `
  mutation facebookRepair($_id: String!) {
    facebookRepair(_id: $_id)
  }
`;

const facebookReplyToComment = `
  mutation facebookReplyToComment($conversationId: String, $content: String, $commentId: String) {
    facebookReplyToComment(conversationId: $conversationId, content: $content, commentId: $commentId) {
      commentId
    }
  }
`;

const facebookChangeCommentStatus = `
  mutation facebookChangeCommentStatus($commentId: String) {
    facebookChangeCommentStatus(commentId: $commentId) {
      commentId
    }
  }
`;

export default {
  facebookUpdateConfigs,
  facebookRepair,
  facebookReplyToComment,
  facebookChangeCommentStatus
};
