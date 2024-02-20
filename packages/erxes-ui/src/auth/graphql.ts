import { getVersion } from '../utils/core';

const { VERSION } = getVersion();

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
      
      ${
        VERSION && VERSION === 'saas'
          ? `
      organizations {
        name
        subdomain
      }
      currentOrganization {
        createdAt
        subdomain
        promoCodes
        name
        icon
        charge
        isWhiteLabel
        setupService
        isPaid
        expiryDate
        plan
        purchased
        onboardingDone
        contactRemaining
        experienceName
        bundleNames
      }`
          : ``
      }


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
