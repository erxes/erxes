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

const widgetsTicketComments = `
  query widgetsTicketComments($typeId: String!, $type: String!) {
    widgetsTicketComments(typeId: $typeId, type: $type) {
      _id
      content
      createdUser {
        _id
        avatar
        firstName
        lastName
        email
      }
      createdAt
      userType
      type
    }
  }
`;

export default {
  clientPortalComments,
  widgetsTicketComments
};
