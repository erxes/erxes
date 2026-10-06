import {
  IconCircleCheck,
  IconPalette,
  IconSparkles,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';

import type { ComponentType } from 'react';

export interface OnboardingStepDef {
  step: number;
  title: string;
  subtitle: string;
  cardTitle: string;
  cardSubtitle: string;
  icon: ComponentType<{ className?: string }>;
}

export function getOnboardingSteps(isOwner?: boolean): OnboardingStepDef[] {
  const welcome: Omit<OnboardingStepDef, 'step'> = {
    title: 'Welcome to erxes',
    subtitle: 'An open-source experience operating system (XOS)',
    cardTitle: 'Welcome',
    cardSubtitle: 'You are here',
    icon: IconSparkles,
  };
  const profile: Omit<OnboardingStepDef, 'step'> = {
    title: 'Create your profile',
    subtitle:
      'Set your login credentials, name and avatar — how your team will see you',
    cardTitle: 'Your Profile',
    cardSubtitle: 'Credentials, name & avatar',
    icon: IconUserCircle,
  };
  const theme: Omit<OnboardingStepDef, 'step'> = {
    title: 'Choose your theme',
    subtitle: 'Light or dark mode — pick the look that is easy on your eyes',
    cardTitle: 'Your Preferences',
    cardSubtitle: 'Light or dark — your call',
    icon: IconPalette,
  };
  const inviteTeam: Omit<OnboardingStepDef, 'step'> = {
    title: 'Invite your team',
    subtitle: 'Add teammates by email so you can collaborate from day one',
    cardTitle: 'Invite team',
    cardSubtitle: 'Bring your crew aboard',
    icon: IconUsers,
  };
  const allSet: Omit<OnboardingStepDef, 'step'> = {
    title: "You're all set",
    subtitle: 'Your workspace is ready — dive in and make it yours',
    cardTitle: 'All set',
    cardSubtitle: 'Ready to roll',
    icon: IconCircleCheck,
  };

  const milestones: OnboardingStepDef[] = [
    { ...welcome, step: 1 },
    { ...profile, step: 2 },
    { ...theme, step: 3 },
    ...(isOwner ? [{ ...inviteTeam, step: 4 }] : []),
    { ...allSet, step: isOwner ? 5 : 4 },
  ];

  return milestones;
}

export function getOnboardingStepForScreen(
  steps: OnboardingStepDef[],
  screenStep: number,
): OnboardingStepDef {
  return (
    steps.find(({ step }) => step === screenStep) ?? steps[steps.length - 1]
  );
}
