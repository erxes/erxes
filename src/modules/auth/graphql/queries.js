const currentUser = `
  query currentUser {
    currentUser {
      _id
      username
      email
      details
      emailSignatures
      getNotificationByEmail
    }
  }
`;

export default {
  currentUser
};
