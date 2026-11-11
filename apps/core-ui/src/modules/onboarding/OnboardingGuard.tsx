import { useAtomValue } from 'jotai';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '~/modules/auth/session';
import { onboardedState } from './state/onboardingState';

/** Where first sign-in onboarding lives (old core-ui `AppPath.MainOnboarding`). */
export const ONBOARDING_PATH = '/welcome';

/** Whether the signed-in user still has to go through the welcome steps. */
export const useNeedsOnboarding = () => {
  const { user } = useSession();

  return !useAtomValue(onboardedState(user.id));
};

/** Sends a user who has not finished onboarding to it (old core-ui `OnboardingGuard`). */
export const OnboardingGuard = ({ children }: { children: ReactNode }) => {
  const needsOnboarding = useNeedsOnboarding();

  if (needsOnboarding) {
    return <Navigate to={ONBOARDING_PATH} replace />;
  }

  return <>{children}</>;
};
