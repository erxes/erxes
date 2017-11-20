const conversationMessageAdd = `
  mutation conversationMessageAdd(
    $conversationId: String!,
    $content: String!,
    $mentionedUserIds: [String],
    $internal: Boolean,
    $attachments: [JSON]
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

const customersEdit = `
  mutation customersEdit(
    $_id: String!,
    $firstName: String,
    $lastName: String,
    $email: String,
    $phone: String,
    $customFieldsData: JSON
  ) {

    customersEdit(
      _id: $_id,
      firstName: $firstName,
      lastName: $lastName,
      email: $email,
      phone: $phone,
      customFieldsData: $customFieldsData
    ) {

      firstName
      lastName
      email
      phone
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

const customersAddCompany = `
  mutation customersAddCompany($_id: String!, $name: String!, $website: String) {
    customersAddCompany(_id: $_id, name: $name, website: $website) {
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

export default {
  conversationMessageAdd,
  conversationsChangeStatus,
  conversationsAssign,
  conversationsUnassign,
  saveResponseTemplate,
  markAsRead,
  customersEdit,
  customersAddCompany
};
