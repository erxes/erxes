const clientPortalCommentsAdd = `
  mutation clientPortalCommentsAdd(
    $typeId: String!
    $type: String!
    $content: String!
    $userType: String!
  ) {
    clientPortalCommentsAdd(
      typeId: $typeId
      type: $type
      content: $content
      userType: $userType
    ) {
      _id
    }
  }
`;

const clientPortalCommentsRemove = `
  mutation clientPortalCommentsRemove(
    $_id: String!
  ) {
    clientPortalCommentsRemove(
      _id: $_id
    ) 
  }
`;

const clientPortalCreateCard = `
  mutation clientPortalCreateCard(
    $type: String!
    $stageId: String!
    $subject: String!
    $description: String
    $priority: String
    $customFieldsData: JSON
    $attachments: [AttachmentInput]
    $labelIds: [String]
  ) {
    clientPortalCreateCard(
      type: $type
      stageId: $stageId
      subject: $subject
      description: $description
      priority: $priority
      customFieldsData: $customFieldsData
      attachments: $attachments
      labelIds: $labelIds
    ) 
  }
`;

export default {
  clientPortalCommentsAdd,
  clientPortalCommentsRemove,
  clientPortalCreateCard
};
