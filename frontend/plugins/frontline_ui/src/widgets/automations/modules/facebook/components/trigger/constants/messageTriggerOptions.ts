import {
  IconMenu2,
  IconMessage,
  IconMessages,
  IconRocket,
} from '@tabler/icons-react';

export const DIRECT_MESSAGE_OPERATOR_TYPES = [
  { label: 'Is Equal to', value: 'isEqual' },
  { label: 'Is Contains', value: 'isContains' },
  { label: 'Is Every keywords includes', value: 'every' },
  { label: 'Is Some keywords includes', value: 'some' },
  { label: 'Start with', value: 'startWith' },
  { label: 'End with', value: 'endWith' },
];

export const MESSAGE_TRIGGER_CONDITIONS = [
  {
    type: 'getStarted',
    label: 'Get Started',
    icon: IconRocket,
    description: 'User click on get started on the messenger',
  },
  {
    type: 'persistentMenu',
    label: 'Persistent menu',
    icon: IconMenu2,
    description: 'User click on persistent menu on the messenger',
  },
  {
    type: 'direct',
    icon: IconMessage,
    label: 'Direct Message',
    description:
      'User sends a direct message. Add keyword conditions only if needed.',
  },
  {
    type: 'open_thread',
    icon: IconMessages,
    label: 'Open Thread',
    description: 'User opens a new thread with the bot',
  },
];
