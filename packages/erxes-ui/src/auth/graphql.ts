export const currentUser = `
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
        birthDate
        shortName
        workStartedDate
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
      departmentIds
      branchIds
      onboardingHistory {
        _id
        userId
        isCompleted
        completedSteps
      }
      isShowNotification
      score
    }
  }
`;

export const userChanged = `
	subscription userChanged($userId: String) {
		userChanged(userId: $userId)
  }
`;
