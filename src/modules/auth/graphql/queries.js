const currentUser = `
  query currentUser {
    currentUser {
      _id
      username
      email
      isOwner
      details {
        avatar
        fullName
        position
        location
        description
        twitterUsername
      }
      links {
        linkedIn
        twitter
        facebook
        youtube
        github
        website
      }

      emailSignatures
      getNotificationByEmail
      permissionActions
    }
  }
`;

export default {
  currentUser
};
