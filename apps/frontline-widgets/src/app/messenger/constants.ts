import { IHeaderItem } from './types';
import {
  IconBubbleText,
  IconSend,
  IconPhone,
  IconBug,
  IconMessage,
  IconBell,
  IconWorldWww,
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
    title: 'Your conversations',
    Icon: IconMessage,
    value: 'messages',
    disabled: false,
    eyebrow: 'Messages',
  },
  {
    title: 'Issue a ticket',
    Icon: IconSend,
    value: 'ticket',
    disabled: true,
    eyebrow: 'Tickets',
  },
  {
    title: 'Help center',
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
  {
    title: 'Schedule a call',
    Icon: IconWorldWww,
    value: 'web-call',
    disabled: false,
  },
];

export const EXCLUDED_TICKET_FORM_FIELDS = [
  'pipelineId',
  'channelId',
  'selectedStatusId',
  'contactType',
  '_id',
];
