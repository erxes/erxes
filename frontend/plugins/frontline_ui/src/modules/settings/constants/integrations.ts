import {
  IconChartBar,
  IconChartPie,
  IconChessKnight,
  IconMailOpened,
  IconMessageCog,
  IconNews,
  IconPuzzle,
} from '@tabler/icons-react';

export const INTEGRATIONS = {
  messenger: {
    img: '/assets/messenger.webp',
    label: 'Messenger',
    description: 'See and reply to Messenger messages in your Team Inbox',
    steps: [
      {
        id: 0,
        name: 'Appearance',
        description: 'Appearance',
        isFinal: false,
        Icon: IconPuzzle,
      },
      {
        id: 1,
        name: 'Greeting',
        description: 'Greeting',
        isFinal: false,
        Icon: IconMailOpened,
      },
      {
        id: 2,
        name: 'Intro',
        description: 'Intro',
        isFinal: false,
        Icon: IconNews,
      },
      {
        id: 3,
        name: 'Hours & Availability',
        description: 'Hours & Availability',
        isFinal: false,
        Icon: IconChessKnight,
      },
      {
        id: 4,
        name: 'Default Settings',
        description: 'Default Settings',
        isFinal: false,
        Icon: IconChartBar,
      },
      {
        id: 5,
        name: 'Config Setup',
        description: 'Config Setup',
        isFinal: false,
        Icon: IconMessageCog,
      },
      {
        id: 6,
        name: 'Add Ons',
        description: 'Add Ons',
        isFinal: true,
        Icon: IconChartPie,
      },
    ],
  },
  'facebook-messenger': {
    img: '/assets/fb-messenger.webp',
    label: 'Facebook Messenger',
    description:
      'Connect and manage Facebook Messages right from your Team Inbox',
    steps: [
      {
        id: 0,
        name: 'Connect accounts',
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 1,
        name: 'Select page',
        isEmpty: {
          name: 'Connect pages',
          description:
            'Connect pages from the linked pages listed below. If your page is not there, try adding it from x.',
        },
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 2,
        name: 'Integration setup',
        description: 'Setup your integration.',
        isFinal: true,
      },
    ],
  },
  'facebook-post': {
    img: '/assets/facebook.webp',
    label: 'Facebook Post',
    description: 'Connect to Facebook posts right from your Team Inbox',
    steps: [
      {
        id: 0,
        name: 'Connect accounts',
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 1,
        name: 'Select page',
        isEmpty: {
          name: 'Connect pages',
          description:
            'Connect pages from the linked pages listed below. If your page is not there, try adding it from x.',
        },
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 2,
        name: 'Integration setup',
        description: 'Setup your integration.',
        isFinal: true,
      },
    ],
  },
  'instagram-post': {
    img: '/assets/instagram.webp',
    label: 'Instagram Post',
    description: 'Connect to Instagram posts right from your Team Inbox',
    steps: [
      {
        id: 0,
        name: 'Connect accounts',
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 1,
        name: 'Select page',
        isEmpty: {
          name: 'Connect pages',
          description:
            'Connect pages from the linked pages listed below. If your page is not there, try adding it from x.',
        },
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 2,
        name: 'Integration setup',
        description: 'Setup your integration.',
        isFinal: true,
      },
    ],
  },
  'instagram-messenger': {
    img: '/assets/instagram.webp',
    label: "Instagram DM's",
    description:
      'Connect and manage Instagram direct messages right from your Team Inbox',
    steps: [
      {
        id: 0,
        name: 'Connect accounts',
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 1,
        name: 'Select page',
        isEmpty: {
          name: 'Connect pages',
          description:
            'Connect pages from the linked pages listed below. If your page is not there, try adding it from x.',
        },
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 2,
        name: 'Integration setup',
        description: 'Setup your integration.',
        isFinal: true,
      },
    ],
  },
  callpro: {
    img: '/assets/callpro.webp',
    label: 'Call Pro',
    description: 'Connect your call pro phone number',
    steps: [
      {
        id: 0,
        name: 'Connect accounts',
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 1,
        name: 'Select page',
        isEmpty: {
          name: 'Connect pages',
          description:
            'Connect pages from the linked pages listed below. If your page is not there, try adding it from x.',
        },
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 2,
        name: 'Integration setup',
        description: 'Setup your integration.',
        isFinal: true,
      },
    ],
  },
  whatsapp: {
    img: '/assets/whatsapp.webp',
    label: 'Whatsapp',
    description: 'Connect and manage Whats App right from your Team Inbox',
    steps: [
      {
        id: 0,
        name: 'Connect accounts',
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 1,
        name: 'Select page',
        isEmpty: {
          name: 'Connect pages',
          description:
            'Connect pages from the linked pages listed below. If your page is not there, try adding it from x.',
        },
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 2,
        name: 'Integration setup',
        description: 'Setup your integration.',
        isFinal: true,
      },
    ],
  },
};

export const OTHER_INTEGRATIONS = {
  webhook: {
    img: '/assets/incoming-webhook.webp',
    label: 'Incoming Webhook',
    description: 'Configure incoming webhooks',
    steps: [
      {
        id: 0,
        name: 'Connect accounts',
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 1,
        name: 'Select page',
        isEmpty: {
          name: 'Connect pages',
          description:
            'Connect pages from the linked pages listed below. If your page is not there, try adding it from x.',
        },
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 2,
        name: 'Integration setup',
        description: 'Setup your integration.',
        isFinal: true,
      },
    ],
  },
  calls: {
    img: '/assets/grandstream.webp',
    label: 'Grand stream',
    description: 'Configure Grand stream device',
    steps: [
      {
        id: 0,
        name: 'Connect accounts',
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 1,
        name: 'Select page',
        isEmpty: {
          name: 'Connect pages',
          description:
            'Connect pages from the linked pages listed below. If your page is not there, try adding it from x.',
        },
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 2,
        name: 'Integration setup',
        description: 'Setup your integration.',
        isFinal: true,
      },
    ],
  },
  imap: {
    img: '/assets/email.webp',
    label: 'IMAP',
    description:
      'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
    steps: [
      {
        id: 0,
        name: 'Connect accounts',
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 1,
        name: 'Select page',
        isEmpty: {
          name: 'Connect pages',
          description:
            'Connect pages from the linked pages listed below. If your page is not there, try adding it from x.',
        },
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 2,
        name: 'Integration setup',
        description: 'Setup your integration.',
        isFinal: true,
      },
    ],
  },
  cloudflarecalls: {
    img: '/assets/email.webp',
    label: 'Web call',
    description: 'Configure Web Call',
    steps: [
      {
        id: 0,
        name: 'Connect accounts',
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 1,
        name: 'Select page',
        isEmpty: {
          name: 'Connect pages',
          description:
            'Connect pages from the linked pages listed below. If your page is not there, try adding it from x.',
        },
        description:
          'Select the accounts where you want to integrate its pages with.',
        isFinal: false,
      },
      {
        id: 2,
        name: 'Integration setup',
        description: 'Setup your integration.',
        isFinal: true,
      },
    ],
  },
};
