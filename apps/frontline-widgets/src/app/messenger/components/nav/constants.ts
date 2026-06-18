import { TNav } from './types';
import {
  IconMessageCircle,
  IconHelpCircle,
  IconHome,
  IconTicket,
} from '@tabler/icons-react';

export const NAVIGATION_MENU: TNav[] = [
  {
    label: 'Home',
    Icon: IconHome,
    tab: 'default',
  },
  {
    label: 'Messages',
    Icon: IconMessageCircle,
    tab: 'messages',
  },
  {
    label: 'Help',
    Icon: IconHelpCircle,
    tab: 'faq',
  },
  {
    label: 'Tickets',
    Icon: IconTicket,
    tab: 'ticket',
  },
];
