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

const clientPortalCreateTicket = `
  mutation clientPortalCreateCard(
    $type: String!
    $stageId: String!
    $subject: String!
    $description: String
    $priority: String
  ) {
    clientPortalCreateCard(
      type: $type
      stageId: $stageId
      subject: $subject
      description: $description
      priority: $priority
    ) 
  }
`;

export default {
  clientPortalCommentsAdd,
  clientPortalCommentsRemove,
  clientPortalCreateTicket 
};
