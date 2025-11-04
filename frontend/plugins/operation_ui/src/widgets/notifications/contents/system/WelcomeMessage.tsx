import {
  IconBrandTrello,
  IconUsers,
  IconCalendarRepeat,
  IconClipboard,
  IconFlag,
} from '@tabler/icons-react';
import {
  WelcomeNotificationContentLayout,
  TOnboardingStepItem,
  TVideoTabItem,
} from 'ui-modules';

export const OnboardingSteps: TOnboardingStepItem[] = [
  {
    icon: <IconFlag size={24} />,
    title: 'Milestone',
    forOwner: false,
    description: 'Define key goals and track overall project progress.',
    action: {
      label: 'coming soon...',
      to: false,
    },
  },
  {
    icon: <IconBrandTrello size={24} />,
    title: 'Task',
    forOwner: false,
    description:
      'Break down work into clear, actionable steps for each team member.',
    action: {
      label: 'Try it out now',
      to: '/operation/tasks',
    },
  },
  {
    icon: <IconClipboard size={24} />,
    title: 'Project',
    forOwner: false,
    description: 'Organize related tasks and workflows under one objective.',
    action: {
      label: 'Try it out now',
      to: '/operation/projects',
    },
  },
  {
    icon: <IconCalendarRepeat size={24} />,
    title: 'Cycle',
    forOwner: false,
    description: 'Plan focused work periods to measure progress and outcomes.',
    action: {
      label: 'Try it out now',
      to: false,
    },
  },
];

const TabItems: TVideoTabItem[] = [
  {
    label: 'Team',
    icon: <IconUsers className="size-4" />,
    time: 1.2,
  },
  {
    label: 'Project',
    icon: <IconClipboard className="size-4" />,
    time: 2.1,
  },
  {
    label: 'Task management',
    icon: <IconBrandTrello className="size-4" />,
    time: 3.7,
  },
  {
    label: 'Cycle',
    icon: <IconCalendarRepeat className="size-4" />,
    time: 10.5,
  },
];

export const WelcomeMessageContent = () => {
  return (
    <WelcomeNotificationContentLayout
      title="erxes Operation"
      description="Team management, ticket management, deal management"
      tabItems={TabItems}
      videoSrc="https://pub-3bcba1ff529f4ce3bf25b4e16962c239.r2.dev/intro.mp4"
      onboardingSteps={OnboardingSteps}
    />
  );
};
