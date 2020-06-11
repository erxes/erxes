const onboardingChanged = `
  subscription onboardingChanged($userId: String!) {
    onboardingChanged(userId: $userId) {
      type
    }
  }
`;

export default {
  onboardingChanged
};
