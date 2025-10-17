import {
  IconBrandTrello,
  IconTicket,
  IconMessage2,
  IconMail,
  IconStackFront,
  IconPhone,
  IconAffiliate,
  IconInfoCircle,
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
      to: '/frontline/inbox',
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
      to: '/frontline/ticket',
    },
  },
  {
    icon: <IconAffiliate size={24} />,
    title: 'Integration',
    forOwner: false,
    description: 'Connect all your communication channels seamlessly.',
    action: {
      label: 'Try it out now',
      to: '/settings/frontline/config',
    },
  },
  {
    icon: <IconInfoCircle size={24} />,
    title: 'Help Center',
    forOwner: false,
    description: 'Build a knowledge base for your customers.',
    action: {
      label: 'coming soon...',
      to: false,
    },
  },
  {
    icon: <IconMessage2 size={24} />,
    title: 'Messenger',
    forOwner: false,
    description:
      'Chat with your customers instantly through your website or app.',
    action: {
      label: 'coming soon...',
      to: false,
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
    time: 34.6,
  },
  {
    label: 'Ticket management',
    icon: <IconBrandTrello className="size-4" />,
    time: 87,
  },
  {
    label: 'Help center',
    icon: <IconInfoCircle className="size-4" />,
    time: 99,
  },
  {
    label: 'Call center',
    icon: <IconPhone className="size-4" />,
    time: 109,
  },
  {
    label: 'Integration',
    icon: <IconAffiliate className="size-4" />,
    time: 118.8,
  },
];

export const WelcomeMessageContent = () => {
  return (
    <WelcomeNotificationContentLayout
      title="erxes Frontline"
      description="Engage customers, respond quickly, improve satisfaction"
      tabItems={TabItems}
      videoSrc="https://pub-3bcba1ff529f4ce3bf25b4e16962c239.r2.dev/frontline-web.mp4"
      videoPoster="https://pub-3bcba1ff529f4ce3bf25b4e16962c239.r2.dev/erxes-frontline-thumbnail.png"
      onboardingSteps={OnboardingSteps}
    />
  );
};
