import type { EmailSettings } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconMail } from '@tabler/icons-react';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  PageContainer,
  PageHeader,
  ScrollArea,
  Spinner,
  Tabs,
  useFormat,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { useIntegrationsSaved } from '../integrations/customMutation';
import { DangerSection } from '../integrations/DangerSection';
import { HowItWorks, OverviewSection, useIntegrationTab } from '../integrations/IntegrationLayout';
import { IntegrationStatusBadge } from '../integrations/IntegrationStatusBadge';
import { EmailForm, PROVIDER_NAMES } from './EmailForm';
import { EmailSenders } from './EmailSenders';

/** Where the organisation's emails go without its settings: the server's address, or nowhere. */
const useWithoutSettings = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const from = useQuery(orpc.emails.defaultSending.queryOptions()).data?.from;

  return from
    ? t('default-from', 'Without your own, emails go out from {{from}}.', { from })
    : t('default-none', 'Without your own, emails aren’t sent: this server has no mail settings.');
};

/** Sends a test email to the member the way the organisation's go out, and says how it went. */
const SendTest = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const { toast } = useToast();
  const client = useQueryClient();

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
      // The test sets or clears "Needs attention".
      onSettled: () => client.invalidateQueries({ queryKey: orpc.emails.settings.key() }),
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

  const message = useWithoutSettings();

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
] as const;

/** Its server refused the last email's login or couldn't be reached: what it said, and since when. */
const Failing = ({ saved }: { saved: EmailSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const fmt = useFormat();

  if (!saved.failedAt) return null;

  return (
    <div role="alert" className="space-y-1 rounded-lg border border-warning p-4 text-sm">
      <p className="font-medium">{t('failing-title', 'Your emails can’t be sent')}</p>
      <p className="text-muted-foreground">
        {t('failing-body', 'Since {{date}} the mail server answers: {{failure}}', {
          date: fmt.dateTime(saved.failedAt),
          failure: saved.failure ?? '',
        })}
      </p>
      <p className="text-muted-foreground">
        {t(
          'failing-fix',
          'Fix the password or server on the Settings tab. The next email that goes out clears this.',
        )}
      </p>
    </div>
  );
};

const NotSetUp = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const defaultSending = useQuery(orpc.emails.defaultSending.queryOptions());
  const withoutSettings = useWithoutSettings();

  return (
    <QueryState query={defaultSending}>
      {() => (
        <p className="rounded-lg border p-4 text-sm">
          {withoutSettings}{' '}
          {t('set-up-hint', 'Set up your own server or account to send from your address.')}
        </p>
      )}
    </QueryState>
  );
};

const Overview = ({ saved }: { saved: EmailSettings | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });

  const server =
    saved?.provider === 'smtp' ? `${saved.smtpHost}:${saved.smtpPort}` : saved?.region || null;

  return (
    <div className="space-y-6">
      {saved && <Failing saved={saved} />}
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
        <NotSetUp />
      )}
      <HowItWorks
        title={t('how', 'How it works')}
        lines={HOW_IT_WORKS.map(([key, text]) => t(`how-${key}`, text))}
      />
    </div>
  );
};

/** Connected, connected but its server refusing, or not set up. */
const stateOf = (saved: EmailSettings | null) => {
  if (!saved) return 'not-set-up';

  return saved.failedAt ? 'attention' : 'connected';
};

const EmailPage = ({ saved }: { saved: EmailSettings | null }) => {
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

  const current = tabs.find((item) => item.value === tab) ?? tabs[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">{t('name.email', 'Email sending')}</h1>
            <IntegrationStatusBadge status={{ state: stateOf(saved) }} />
          </div>
          <p className="text-sm text-muted-foreground">
            {t(
              'catalog.email',
              'Invitations, notifications and broadcasts from your own address: SMTP, SendGrid or Amazon SES.',
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {saved ? (
            <SendTest />
          ) : (
            <Button onClick={() => setTab('settings')}>{t('email.set-up-short', 'Set up')}</Button>
          )}
        </div>
      </header>
      <Tabs value={current?.value} onValueChange={setTab}>
        <Tabs.List variant="flush" className="h-9">
          {tabs.map((item) => (
            <Tabs.Trigger key={item.value} value={item.value}>
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
      {current?.content}
    </div>
  );
};

/** Settings › Email sending: how the organisation's emails go out, its settings and senders. */
export const EmailSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const canManage = useCan()('integrations.manage');

  const settings = useQuery(
    orpc.emails.settings.queryOptions({ input: canManage ? undefined : skipToken }),
  );

  if (!canManage) return <Navigate to={paths.settings.root} replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('name.email', 'Email sending'), to: paths.settings.email, icon: IconMail },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1" fitWidth>
        <QueryState query={settings} className="py-12">
          {(saved) => <EmailPage saved={saved} />}
        </QueryState>
      </ScrollArea>
    </PageContainer>
  );
};
