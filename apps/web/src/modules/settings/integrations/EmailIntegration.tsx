import type { EmailSettings } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Spinner, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import type { Integration } from './catalog';
import { useIntegrationsSaved } from './customMutation';
import { DangerSection } from './DangerSection';
import { EmailForm, PROVIDER_NAMES } from './EmailForm';
import { EmailSenders } from './EmailSenders';
import {
  HowItWorks,
  IntegrationLayout,
  OverviewSection,
  useIntegrationTab,
} from './IntegrationLayout';

/** Sends a test email to the member the way the organisation's go out, and says how it went. */
const SendTest = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const { toast } = useToast();

  const failed = (description?: string) =>
    toast({
      variant: 'destructive',
      title: t('test-failed', 'The test email was not sent'),
      description,
    });

  const test = useMutation(
    orpc.emails.sendTest.mutationOptions({
      onSuccess: (result) =>
        result.ok
          ? toast({ title: t('test-sent', 'Test email sent to you') })
          : failed(result.error ?? undefined),
      onError: (error) => failed(messageOf(error)),
    }),
  );

  return (
    <Button variant="secondary" disabled={test.isPending} onClick={() => test.mutate({})}>
      {test.isPending ? <Spinner size="sm" /> : t('test', 'Send test email')}
    </Button>
  );
};

/** Back to the server's sending, after asking: the danger zone at the end of the settings. */
const RemoveEmail = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });

  const remove = useMutation(
    orpc.emails.removeSettings.mutationOptions(
      useIntegrationsSaved(t('save-failed', 'Could not save'), undefined, orpc.emails.key()),
    ),
  );

  const message = t('remove-description', 'Emails go out from erxes’s address again.');

  return (
    <DangerSection
      title={t('remove-title', 'Stop sending from your address')}
      description={message}
      confirmMessage={message}
      label={t('remove', 'Remove')}
      pending={remove.isPending}
      onConfirm={() => remove.mutate({})}
    />
  );
};

const HOW_IT_WORKS = [
  ['all', 'Invitations, password resets, notifications, automations and broadcasts all use it.'],
  [
    'senders',
    'Broadcasts and automations can send as a confirmed sender instead (the Senders tab).',
  ],
  ['verify', 'SendGrid and Amazon SES only send from addresses or domains you verified with them.'],
  ['none', 'Without it, emails go out from erxes’s address.'],
] as const;

const Overview = ({ saved }: { saved: EmailSettings | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });

  const server =
    saved?.provider === 'smtp' ? `${saved.smtpHost}:${saved.smtpPort}` : saved?.region || null;

  return (
    <div className="space-y-6">
      {saved ? (
        <OverviewSection title={t('sending-as', 'Sending as')}>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-1.5 rounded-lg border p-4 text-sm">
            <dt className="text-muted-foreground">{t('field.fromEmail', 'From address')}</dt>
            <dd className="col-span-2 truncate">
              {saved.fromName ? `${saved.fromName} <${saved.fromEmail}>` : saved.fromEmail}
            </dd>
            <dt className="text-muted-foreground">{t('field.provider', 'Send through')}</dt>
            <dd className="col-span-2">
              {t(`provider.${saved.provider}`, PROVIDER_NAMES[saved.provider])}
            </dd>
            {server && (
              <>
                <dt className="text-muted-foreground">{t('server', 'Server')}</dt>
                <dd className="col-span-2 truncate">{server}</dd>
              </>
            )}
          </dl>
        </OverviewSection>
      ) : (
        <p className="rounded-lg border p-4 text-sm">
          {t(
            'set-up-hint',
            'Emails go out from erxes’s address. Set up your own server or account to send from yours.',
          )}
        </p>
      )}
      <HowItWorks
        title={t('how', 'How it works')}
        lines={HOW_IT_WORKS.map(([key, text]) => t(`how-${key}`, text))}
      />
    </div>
  );
};

const EmailPage = ({
  integration,
  saved,
}: {
  integration: Integration;
  saved: EmailSettings | null;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const [tab, setTab] = useIntegrationTab('overview');

  const tabs = [
    {
      value: 'overview',
      label: t('tab.overview', 'Overview'),
      content: <Overview saved={saved} />,
    },
    {
      value: 'settings',
      label: t('tab.settings', 'Settings'),
      content: (
        <div className="space-y-6">
          <EmailForm key={saved?.updatedAt ?? 'new'} saved={saved} />
          {saved && <RemoveEmail />}
        </div>
      ),
    },
    {
      value: 'senders',
      label: t('tab.senders', 'Senders'),
      content: <EmailSenders saved={saved} />,
    },
  ];

  return (
    <IntegrationLayout
      integration={integration}
      tabs={tabs}
      tab={tab}
      onTab={setTab}
      actions={
        saved ? (
          <SendTest />
        ) : (
          <Button onClick={() => setTab('settings')}>{t('email.set-up-short', 'Set up')}</Button>
        )
      }
    />
  );
};

/** Email sending's page: how the organisation's emails go out, and its settings. */
export const EmailIntegration = ({ integration }: { integration: Integration }) => {
  const settings = useQuery(orpc.emails.settings.queryOptions());

  return (
    <QueryState query={settings}>
      {(saved) => <EmailPage integration={integration} saved={saved} />}
    </QueryState>
  );
};
