import {
  IconForms,
  IconBrandTrello,
  IconMessage,
  IconChartCovariate,
  IconTicket,
  IconBriefcase,
  IconMessageCircle,
  IconMessage2,
  IconMail,
} from '@tabler/icons-react';
import {
  WelcomeNotificationContentLayout,
  TOnboardingStepItem,
  TReadOnlyTabItem,
} from 'ui-modules';

export const OnboardingSteps: TOnboardingStepItem[] = [
  {
    icon: <IconMail size={24} />,
    title: 'Team inbox',
    forOwner: false,
    description:
      'Built with ShadCN and Radix UI for a more accessible interface.',
    action: {
      label: 'Try it out now',
      to: '#',
    },
  },
  {
    icon: <IconTicket size={24} />,
    title: 'Ticket',
    forOwner: false,
    description:
      'Built with ShadCN and Radix UI for a more accessible interface.',
    action: {
      label: 'Try it out now',
      to: '#',
    },
  },
  {
    icon: <IconBriefcase size={24} />,
    title: 'Deal',
    forOwner: false,
    description:
      'Built with ShadCN and Radix UI for a more accessible interface.',
    action: {
      label: 'Try it out now',
      to: '#',
    },
  },
  {
    icon: <IconMessageCircle size={24} />,
    title: 'Business messenger',
    forOwner: false,
    description:
      'Built with ShadCN and Radix UI for a more accessible interface.',
    action: {
      label: 'Try it out now',
      to: '#',
    },
  },
  {
    icon: <IconMessage2 size={24} />,
    title: 'Business messenger',
    forOwner: false,
    description:
      'Built with ShadCN and Radix UI for a more accessible interface.',
    action: {
      label: 'Try it out now',
      to: '#',
    },
  },
];

const TabItems: TReadOnlyTabItem[] = [
  {
    label: 'Pop-up forms',
    icon: <IconForms className="size-4" />,
  },
  {
    label: 'Contacts',
    icon: <IconMail className="size-4" />,
  },
  {
    label: 'Ticket management',
    icon: <IconBrandTrello className="size-4" />,
    isActive: true,
  },
  {
    label: 'Business messenger',
    icon: <IconMessage className="size-4" />,
  },
  {
    label: 'Insight',
    icon: <IconChartCovariate className="size-4" />,
  },
];

export const WelcomeMessageContent = () => {
  return (
    <WelcomeNotificationContentLayout
      title="erxes Frontline"
      description="Engage customers, respond quickly, improve satisfaction"
      tabItems={TabItems}
      videoSrc="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      onboardingSteps={OnboardingSteps}
    />
  );
};
