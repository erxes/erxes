import {
  IconUsers,
  IconSettings,
} from '@tabler/icons-react';
import { WelcomeNotificationContentLayout, TOnboardingStepItem } from 'ui-modules';


const OnboardingSteps: TOnboardingStepItem[] = [
  {
    icon: <IconUsers className="size-5" />,
    title: 'Invite Your Team',
    description:
      'Collaborate better by inviting team members to join your workspace and start working together.',
    action: {
      label: 'Invite Team Member',
      to: '/settings/team-member',
    },
  },
  {
    icon: <IconSettings className="size-5" />,
    title: 'Customize Your Workspace',
    forOwner: true,
    description:
      'Tailor your workspace to your preferences with customizable settings.',
    action: {
      label: 'Customize Workspace',
      to: '/settings/workspace',
    },
  },
  {
    icon: <IconSettings className="size-5" />,
    title: 'Customize Your Workspace',
    forOwner: true,
    description:
      'Tailor your workspace to your preferences with customizable settings.',
    action: {
      label: 'Customize Workspace',
      to: '/settings/workspace',
    },
  },
];



export const WelcomeMessageContent = () => {
  return (
    <WelcomeNotificationContentLayout
      title="Welcome to erxes"
      description="A New Experience Begins!"
      videoSrc="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      onboardingSteps={OnboardingSteps}
    />
  );
};
