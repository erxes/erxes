const clientPortalComments = `
  query clientPortalComments($typeId: String!, $type: String!) {
    clientPortalComments(typeId: $typeId, type: $type) {
      _id
      content
      createdUser {
        _id
        avatar
        firstName
        fullName
        lastName
        email
        username
      }
      createdAt
      userType
      type
    }
  }
`;

export default {
  clientPortalComments
};
