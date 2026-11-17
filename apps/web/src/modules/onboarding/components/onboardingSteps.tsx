import {
  IconCircleCheck,
  IconLock,
  IconPalette,
  IconSparkles,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

export interface OnboardingStepDef {
  key: 'welcome' | 'password' | 'profile' | 'theme' | 'invite' | 'done';
  step: number;
  title: string;
  subtitle: string;
  cardTitle: string;
  cardSubtitle: string;
  icon: ComponentType<{ className?: string }>;
}

/**
 * `needsPassword`: the member has none yet (a SaaS owner comes in signed in
 * from erxes.io), so they set one right after the welcome.
 */
export function getOnboardingSteps({
  canInvite,
  needsPassword,
}: {
  canInvite?: boolean;
  needsPassword?: boolean;
} = {}): OnboardingStepDef[] {
  const welcome: Omit<OnboardingStepDef, 'step'> = {
    key: 'welcome',
    title: 'Welcome to erxes',
    subtitle: 'An open-source experience operating system (XOS)',
    cardTitle: 'Welcome',
    cardSubtitle: 'You are here',
    icon: IconSparkles,
  };

  const password: Omit<OnboardingStepDef, 'step'> = {
    key: 'password',
    title: 'Set your password',
    subtitle: 'So you can also sign in at your workspace address',
    cardTitle: 'Your Password',
    cardSubtitle: 'Sign in directly',
    icon: IconLock,
  };

  const profile: Omit<OnboardingStepDef, 'step'> = {
    key: 'profile',
    title: 'Create your profile',
    subtitle: 'Set your name, username and avatar — how your team will see you',
    cardTitle: 'Your Profile',
    cardSubtitle: 'Name, username & avatar',
    icon: IconUserCircle,
  };

  const theme: Omit<OnboardingStepDef, 'step'> = {
    key: 'theme',
    title: 'Choose your theme',
    subtitle: 'Light or dark mode — pick the look that is easy on your eyes',
    cardTitle: 'Your Preferences',
    cardSubtitle: 'Light or dark — your call',
    icon: IconPalette,
  };

  const inviteTeam: Omit<OnboardingStepDef, 'step'> = {
    key: 'invite',
    title: 'Invite your team',
    subtitle: 'Add teammates by email so you can collaborate from day one',
    cardTitle: 'Invite team',
    cardSubtitle: 'Bring your crew aboard',
    icon: IconUsers,
  };

  const allSet: Omit<OnboardingStepDef, 'step'> = {
    key: 'done',
    title: "You're all set",
    subtitle: 'Your workspace is ready — dive in and make it yours',
    cardTitle: 'All set',
    cardSubtitle: 'Ready to roll',
    icon: IconCircleCheck,
  };

  return [
    welcome,
    ...(needsPassword ? [password] : []),
    profile,
    theme,
    ...(canInvite ? [inviteTeam] : []),
    allSet,
  ].map((def, index) => ({ ...def, step: index + 1 }));
}

export function getOnboardingStepForScreen(steps: OnboardingStepDef[], screenStep: number) {
  return steps.find(({ step }) => step === screenStep) ?? steps.at(-1);
}
