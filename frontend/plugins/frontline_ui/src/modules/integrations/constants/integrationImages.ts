import { IconForms, IconMessageFilled, IconPhone } from '@tabler/icons-react';
import type { FC } from 'react';
import {
  InstagramIcon,
  MessengerIcon,
  FacebookIcon,
} from '@/integrations/components/Icons';

export const INTEGRATION_ICONS: Record<string, FC<any>> = {
  'facebook-messenger': MessengerIcon,
  'facebook-post': FacebookIcon,
  lead: IconForms,
  'instagram-messenger': InstagramIcon,
  'instagram-post': InstagramIcon,
  messenger: IconMessageFilled,
  calls: IconPhone,
};
