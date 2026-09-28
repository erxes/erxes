import { BROADCAST_EMAIL_PROVIDER } from '@/broadcast/graphql/queries';
import { useQuery } from '@apollo/client';

const PROVIDER_NAMES: Record<string, string> = {
  SES: 'Amazon SES',
  sendgrid: 'SendGrid',
  custom: 'your mail server',
};

/**
 * What to call the thing that carries these emails.
 *
 * Every figure on a campaign is reported by whichever provider sent it, and
 * naming the wrong one turns an explanation into a lie — a SendGrid account
 * has never heard of an SES rejection.
 */
export const useBroadcastEmailProvider = () => {
  const { data, loading } = useQuery<{
    emailSenderOptions?: { provider?: string };
  }>(BROADCAST_EMAIL_PROVIDER);

  const provider = data?.emailSenderOptions?.provider;

  return {
    provider,
    providerName: PROVIDER_NAMES[provider || ''] || 'your email provider',
    loading,
  };
};
