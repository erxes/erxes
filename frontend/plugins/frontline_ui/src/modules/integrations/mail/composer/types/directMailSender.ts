import type { ChannelScope } from '@/channels/types';
import type { MailSender } from '@/integrations/mail/composer/types/directMailComposer';

export interface DirectMailSenderSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  onBlur: () => void;
  invalid: boolean;
  hasError: boolean;
}

export interface DirectMailSenderGroupProps {
  scope: ChannelScope;
  senders: MailSender[];
}

export interface DirectMailSenderItemProps {
  sender: MailSender;
}
