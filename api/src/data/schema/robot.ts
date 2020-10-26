export const types = `
  type RobotEntry {
    _id: String
    action: String
    data: JSON
  }

  type OnboardingGetAvailableFeaturesResponse {
    name: String
    settings: [String]
    showSettings: Boolean
    isComplete: Boolean
  }

  type OnboardingNotification {
    userId: String
    type: String
  }

  type OnboardingHistory {
    _id: String
    userId: String
    isCompleted: Boolean
    completedSteps: [String]
  }
`;

export const queries = `
  robotEntries(isNotified: Boolean, action: String, parentId: String): [RobotEntry]
  onboardingStepsCompleteness(steps: [String]): JSON
  onboardingGetAvailableFeatures: [OnboardingGetAvailableFeaturesResponse]
`;

export const mutations = `
  robotEntriesMarkAsNotified(_id: String): [RobotEntry]
  onboardingCheckStatus: String
  onboardingForceComplete: JSON
  onboardingCompleteShowStep(step: String): JSON
`;
