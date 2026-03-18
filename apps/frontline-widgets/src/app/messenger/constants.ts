import { IHeaderItem } from './types';
import {
  IconBubbleText,
  IconSend,
  IconPhone,
  IconBug,
  IconMessage,
} from '@tabler/icons-react';

export enum WelcomeMessage {
  TITLE = 'Need help?',
  MESSAGE = 'Get help with setting up using erxes.',
  AVAILABILITY_MESSAGE = "We're available between 9.00 am and 6.00 pm (GMT +8). We'll get back to you as soon as possible.",
}

export enum InitialMessage {
  WELCOME = 'Welcome to erxes! How can I help you today?',
  AWAY = "I'm currently offline. We'll get back to you as soon as possible.",
  THANK = 'Thank you for contacting erxes.',
}
export const HEADER_ITEMS: IHeaderItem[] = [
  {
    title: 'Chat',
    Icon: IconMessage,
    value: 'chat',
    disabled: false,
  },
  {
    title: 'Issue a ticket',
    Icon: IconSend,
    value: 'ticket',
    disabled: true,
  },
  {
    title: 'FAQ',
    Icon: IconBubbleText,
    value: 'faq',
    disabled: true,
  },
  {
    title: 'Book a call',
    Icon: IconPhone,
    value: 'call',
    disabled: true,
  },
  {
    title: 'Report a bug',
    Icon: IconBug,
    value: 'bug',
    disabled: true,
  },
];

/** How long to wait after the user stops typing before sending a stop-typing event. */
export const TYPING_STOP_TIMEOUT_MS = 3_000;

/** How long after the last agent-typing event before clearing the typing indicator. */
export const AGENT_TYPING_CLEAR_TIMEOUT_MS = 4_000;

export const EXCLUDED_TICKET_FORM_FIELDS = [
  'pipelineId',
  'channelId',
  'selectedStatusId',
  'contactType',
  '_id',
];
