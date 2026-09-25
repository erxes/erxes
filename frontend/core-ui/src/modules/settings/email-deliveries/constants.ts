import {
  IconBolt,
  IconMail,
  IconProgressCheck,
  IconProgressX,
  IconSend,
  IconSpeakerphone,
} from '@tabler/icons-react';

export const EMAIL_DELIVERIES_CURSOR_SESSION_KEY = 'email-deliveries-cursor';

export const EMAIL_DELIVERY_STATUS_OPTIONS = [
  { value: 'sent', label: 'Sent', icon: IconProgressCheck },
  { value: 'failed', label: 'Failed', icon: IconProgressX },
  { value: 'queued', label: 'Queued', icon: IconSend },
] as const;

export const EMAIL_DELIVERY_SOURCE_OPTIONS = [
  { value: 'automation', label: 'Automation', icon: IconBolt },
  { value: 'broadcast', label: 'Broadcast', icon: IconSpeakerphone },
  { value: 'transactional', label: 'Transactional', icon: IconMail },
] as const;

export const EMAIL_DELIVERY_PROVIDER_OPTIONS = [
  { value: 'sendgrid', label: 'SendGrid', icon: IconSend },
  { value: 'ses', label: 'AWS SES', icon: IconSend },
  { value: 'smtp', label: 'SMTP', icon: IconSend },
] as const;
