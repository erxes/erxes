import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useSession } from '~/modules/auth/session';

/** Whether the signed-in user still has to go through the welcome steps. */
export const useNeedsOnboarding = () => {
  const { user } = useSession();

  // Kept on the member, so every browser knows.
  return !user.onboardedAt;
};

/** Sends a user who has not finished onboarding to it. */
export const OnboardingGuard = ({ children }: { children: ReactNode }) => {
  const needsOnboarding = useNeedsOnboarding();

  if (needsOnboarding) {
    return <Navigate to={paths.welcome} replace />;
  }

  return <>{children}</>;
};
