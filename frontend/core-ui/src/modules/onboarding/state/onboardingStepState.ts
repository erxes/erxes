import { atomWithStorage } from 'jotai/utils';

export const onboardingStepState = atomWithStorage<number>(
  'erxes-onboarding-step',
  1,
);
