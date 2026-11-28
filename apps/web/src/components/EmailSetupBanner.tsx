import type { EmailSender } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconMailOff } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';

const PROVIDERS: Record<EmailSender['provider'], string> = {
  smtp: 'SMTP',
  sendgrid: 'SendGrid',
  ses: 'Amazon SES',
  log: 'log',
};

/** How the organisation's email goes out, in the member's words: "SendGrid", "the server's log". */
export const useProviderName = () => {
  const { t } = useTranslation('common', { keyPrefix: 'email-setup.via' });

  return (provider: EmailSender['provider']) => t(provider, PROVIDERS[provider]);
};

/** True while email would only reach the server's log (production, nothing set up). */
export const useEmailUndeliverable = (enabled = true) =>
  useQuery(orpc.emails.sender.queryOptions({ enabled })).data?.canDeliver === false;

/** What stops email from going out, and a link to where it is set up (off on that page itself). */
export const EmailAlert = ({
  title,
  description,
  settingsLink = true,
}: {
  title: string;
  description: string;
  settingsLink?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'email-setup' });

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-text"
    >
      <IconMailOff className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p>{description}</p>
        {settingsLink && (
          <Link className="font-medium underline" to={paths.settings.email}>
            {t('link', 'Settings › Organization email')}
          </Link>
        )}
      </div>
    </div>
  );
};

/**
 * Says email can't be sent and where to set it up; nothing once it can.
 * `settingsLink` is off on the email settings page itself.
 */
export const EmailSetupBanner = ({ settingsLink = true }: { settingsLink?: boolean }) => {
  const { t } = useTranslation('common', { keyPrefix: 'email-setup' });
  const undeliverable = useEmailUndeliverable();

  if (!undeliverable) return null;

  return (
    <EmailAlert
      settingsLink={settingsLink}
      title={t('title', 'Organization email isn’t set up')}
      description={t(
        'description',
        'Emails would only be written to the server’s log, so broadcasts, tests and automation emails are not sent. Set up a provider, or set EMAIL_SMTP_URL on the server.',
      )}
    />
  );
};
