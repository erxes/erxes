const forceComplete = `
  mutation {
    onboardingForceComplete
  }
`;

const completeShowStep = `
  mutation onboardingCompleteShowStep($step: String) {
    onboardingCompleteShowStep(step: $step)
  }
`;

const checkStatus = `
  mutation onboardingCheckStatus {
    onboardingCheckStatus
  }
`;

export default { checkStatus, completeShowStep, forceComplete };
