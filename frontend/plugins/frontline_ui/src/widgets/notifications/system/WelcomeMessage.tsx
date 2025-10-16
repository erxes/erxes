import {
  IconBrandTrello,
  IconTicket,
  IconBriefcase,
  IconMessageCircle,
  IconMessage2,
  IconMail,
  IconStackFront,
  IconAffiliate,
  IconSparkles,
  IconGraph,
} from '@tabler/icons-react';
import {
  WelcomeNotificationContentLayout,
  TOnboardingStepItem,
  TVideoTabItem,
} from 'ui-modules';

export const OnboardingSteps: TOnboardingStepItem[] = [
  {
    icon: <IconMail size={24} />,
    title: 'Inbox',
    forOwner: false,
    description:
      'Manage all your conversations from every channel in one place.',
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
      'Turn important conversations into tasks for better follow-up.',
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

const TabItems: TVideoTabItem[] = [
  {
    label: 'Frontline',
    icon: <IconStackFront className="size-4" />,
    time: 0,
  },
  {
    label: 'Inbox',
    icon: <IconMail className="size-4" />,
    time: 28.7,
  },
  {
    label: 'Ticket management',
    icon: <IconBrandTrello className="size-4" />,
    time: 52.5,
  },
  {
    label: 'Automation',
    icon: <IconAffiliate className="size-4" />,
    time: 74.5,
  },
  {
    label: 'Ai assistant',
    icon: <IconSparkles className="size-4" />,
    time: 94.4,
  },
  {
    label: 'Insight',
    icon: <IconGraph className="size-4" />,
    time: 112.4,
  },
];

export const WelcomeMessageContent = () => {
  return (
    <WelcomeNotificationContentLayout
      title="erxes Frontline"
      description="Engage customers, respond quickly, improve satisfaction"
      tabItems={TabItems}
      videoSrc="https://pub-3bcba1ff529f4ce3bf25b4e16962c239.r2.dev/frontline-web.mp4"
      onboardingSteps={OnboardingSteps}
    />
  );
};
