const currentUser = `
  query currentUser {
    currentUser {
      _id
      createdAt
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
      links
      emailSignatures
      getNotificationByEmail
      permissionActions
      configs
      configsConstants
      onboardingHistory {
        _id
        userId
        isCompleted
        completedSteps
      }
    }
  }
`;

export default { currentUser };
