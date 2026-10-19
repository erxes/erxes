import {
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconBrandInstagramFilled,
  IconBrandLinkedinFilled,
  IconBriefcase,
  IconMail,
  IconMailFilled,
  IconMessage2,
  IconMessageCircle,
  IconTicket,
} from '@tabler/icons-react';
import {
  type TOnboardingStepItem,
  type TSocialItem,
} from 'ui-modules/modules/notifications/types/welcome';

export const WELCOME_SOCIALS: TSocialItem[] = [
  {
    icon: <IconMailFilled className="size-5" />,
    url: 'mailto:info@erxes.io',
    label: 'Email erxes',
  },
  {
    icon: <IconBrandInstagramFilled className="size-5" />,
    url: 'https://www.instagram.com/erxeshq/',
    label: 'erxes on Instagram',
  },
  {
    icon: <IconBrandLinkedinFilled className="size-5" />,
    url: 'https://www.linkedin.com/company/erxes/',
    label: 'erxes on LinkedIn',
  },
  {
    icon: <IconBrandGithubFilled className="size-5" />,
    url: 'https://github.com/erxes',
    label: 'erxes on GitHub',
  },
  {
    icon: <IconBrandDiscordFilled className="size-5" />,
    url: 'https://discord.gg/qEaghUeG5C',
    label: 'erxes on Discord',
  },
];

export const OnboardingSteps: TOnboardingStepItem[] = [
  {
    id: 'team-inbox',
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
    id: 'ticket',
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
    id: 'deal',
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
    id: 'business-messenger',
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
    id: 'messenger',
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

export const WELCOME_FALLBACK_SOCIALS = [
  WELCOME_SOCIALS[0],
  WELCOME_SOCIALS[1],
  WELCOME_SOCIALS[2],
  WELCOME_SOCIALS[4],
  WELCOME_SOCIALS[3],
];

export const WELCOME_FALLBACK_VIDEO_SRC =
  'https://pub-3bcba1ff529f4ce3bf25b4e16962c239.r2.dev/intro.mp4';
