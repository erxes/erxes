const currentUser = `
  query currentUser {
    currentUser {
      _id
      username
      email
      isOwner
      brands {
        _id
        name
      }
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
      emailSignatures
      getNotificationByEmail
      permissionActions
    }
  }
`;

export default { currentUser };
