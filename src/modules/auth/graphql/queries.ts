const currentUser = `
  query currentUser {
    currentUser {
      _id
      username
      email
      details {
        avatar
        fullName
        shortName
        position
        location
        description
      }
      links {
        linkedIn
        twitter
        facebook
        youtube
        github
        website
      }
      hasSeenOnBoard
      emailSignatures
      getNotificationByEmail
    }
  }
`;

export default {
  currentUser
};
