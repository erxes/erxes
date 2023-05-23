const clientPortalComments = `
  query clientPortalComments($typeId: String!, $type: String!) {
    clientPortalComments(typeId: $typeId, type: $type) {
      _id
      content
      createdUser 
      createdAt
      userType
      type
    }
  }
`;

export default {
  clientPortalComments
};
