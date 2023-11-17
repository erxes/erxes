const instagramUpdateConfigs = `
  mutation instagramUpdateConfigs($configsMap: JSON!) {
    instagramUpdateConfigs(configsMap: $configsMap)
  }
`;

const instagramRepair = `
  mutation instagramRepair($_id: String!) {
    instagramRepair(_id: $_id)
  }
`;

const instagramReplyToComment = `
  mutation instagramReplyToComment($conversationId: String, $content: String, $commentId: String) {
    instagramReplyToComment(conversationId: $conversationId, content: $content, commentId: $commentId) {
      commentId
    }
  }
`;

const instagramChangeCommentStatus = `
  mutation instagramChangeCommentStatus($commentId: String) {
    instagramChangeCommentStatus(commentId: $commentId) {
      commentId
    }
  }
`;

export default {
  instagramUpdateConfigs,
  instagramRepair,
  instagramReplyToComment,
  instagramChangeCommentStatus
};
