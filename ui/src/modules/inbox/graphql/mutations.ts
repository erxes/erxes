import messageFields from './messageFields';
import { paramsDef, paramsValue } from './queries';

const conversationMessageAdd = `
  mutation conversationMessageAdd(
    $conversationId: String,
    $content: String,
    $contentType: String,
    $mentionedUserIds: [String],
    $internal: Boolean,
    $attachments: [AttachmentInput],
    $facebookMessageTag: String
  ) {
    conversationMessageAdd(
      conversationId: $conversationId,
      content: $content,
      contentType: $contentType,
      mentionedUserIds: $mentionedUserIds,
      internal: $internal,
      attachments: $attachments,
      facebookMessageTag: $facebookMessageTag
    ) {
      ${messageFields}
    }
  }
`;

const conversationsReplyFacebookComment = `
  mutation conversationsReplyFacebookComment(
    $conversationId: String,
    $content: String,
    $commentId: String,
  ) {
    conversationsReplyFacebookComment(
    conversationId: $conversationId,
    content: $content,
    commentId: $commentId,
  ) {
    commentId
  }
}
`;

const conversationsChangeStatusFacebookComment = `
  mutation conversationsChangeStatusFacebookComment(
    $commentId: String,
  ) {
    conversationsChangeStatusFacebookComment(
    commentId: $commentId,
  ) {
    commentId
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

const resolveAll = `
  mutation conversationResolveAll(${paramsDef}) {
    conversationResolveAll(${paramsValue})
  }
`;

const editCustomFields = `
  mutation conversationEditCustomFields($_id: String!, $customFieldsData: JSON) {
    conversationEditCustomFields(_id: $_id, customFieldsData: $customFieldsData) {
      _id
    }
  }
`;

export default {
  conversationsReplyFacebookComment,
  conversationMessageAdd,
  conversationsChangeStatus,
  conversationsAssign,
  conversationsUnassign,
  saveResponseTemplate,
  markAsRead,
  conversationsChangeStatusFacebookComment,
  resolveAll,
  editCustomFields
};
