const clientPortalCommentsRemove = `
  mutation clientPortalCommentsRemove(
    $_id: String!
  ) {
    clientPortalCommentsRemove(
      _id: $_id
    ) 
  }
`;

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

export default {
  clientPortalCommentsRemove,
  clientPortalCommentsAdd
};
