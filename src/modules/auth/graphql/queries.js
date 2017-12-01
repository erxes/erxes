const currentUser = `
  query currentUser {
    currentUser {
      _id
      username
      email
      details {
        avatar
        fullName
        position
        twitterUsername
      }

      emailSignatures
      getNotificationByEmail
    }
  }
`;

export default {
  currentUser
};
