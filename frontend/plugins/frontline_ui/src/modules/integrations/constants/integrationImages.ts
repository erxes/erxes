import {
  IconBrandDiscord,
  IconBrandTelegram,
  IconForms,
  IconMessageFilled,
  IconPhone,
} from '@tabler/icons-react';
import {
  InstagramIcon,
  MessengerIcon,
  FacebookIcon,
} from '@/integrations/components/Icons';

export const INTEGRATION_ICONS: Record<
  string,
  typeof IconBrandTelegram | typeof MessengerIcon
> = {
  'facebook-messenger': MessengerIcon,
  'facebook-post': FacebookIcon,
  lead: IconForms,
  'instagram-messenger': InstagramIcon,
  'instagram-post': InstagramIcon,
  messenger: IconMessageFilled,
  calls: IconPhone,
  callpro: IconPhone,
  'telegram-messenger': IconBrandTelegram,
  'discord-messenger': IconBrandDiscord,
};
