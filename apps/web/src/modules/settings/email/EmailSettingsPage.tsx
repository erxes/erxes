import type { EmailSender, EmailSettings } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconMail } from '@tabler/icons-react';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { Button, PageContainer, PageHeader, ScrollArea, Spinner, Tabs, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { EmailSetupBanner, useProviderName } from '~/components/EmailSetupBanner';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { useIntegrationsSaved } from '../integrations/useIntegrationsSaved';
import { DangerSection } from '../integrations/DangerSection';
import { HowItWorks, OverviewSection, useIntegrationTab } from '../integrations/IntegrationLayout';
import { IntegrationStatusBadge } from '../integrations/IntegrationStatusBadge';
import { EmailAddressesTab } from './EmailAddressesTab';
import { EmailDeliveriesTab } from './EmailDeliveriesTab';
import { EventsHelp } from './EmailEvents';
import { EmailForm, PROVIDER_NAMES } from './EmailForm';
import { EmailHaltNotice } from './EmailHaltBanner';
import { EmailLimitsTab } from './EmailLimitsTab';
import { ReplyTosSection } from './ReplyTosSection';
import { ServerSender } from './ServerSender';

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
  ['verify', 'SendGrid and Amazon SES only send from addresses or domains you verified with them.'],
  ['reply-to', 'Replies go only to the Reply-To addresses you confirmed.'],
  ['none', 'Without it, emails go out from erxes’s address.'],
] as const;

const HOW_IT_WORKS_SERVER = [
  ['all', 'Invitations, password resets, notifications, automations and broadcasts all use it.'],
  ['server', 'Every email goes out from erxes’ address under your organisation’s name.'],
  ['label', 'A broadcast or automation adds a label after the name, such as “Marketing”.'],
  ['reply-to', 'Replies go only to the Reply-To addresses you confirmed.'],
] as const;

/** The server's sender and how it sends: "Acme <no-reply@erxes.io> · via SendGrid". */
const ServerSending = ({ sender }: { sender: EmailSender }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const providerName = useProviderName();

  return (
    <OverviewSection title={t('sending-as', 'Sending as')}>
      <p className="rounded-lg border p-4 text-sm">
        {t('sending-line', '{{name}} <{{address}}> · via {{provider}}', {
          name: sender.name,
          address: sender.address,
          provider: providerName(sender.provider),
        })}
      </p>
    </OverviewSection>
  );
};

const Overview = ({ sender, saved }: { sender: EmailSender; saved: EmailSettings | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });

  if (!sender.ownSending) {
    return (
      <div className="space-y-6">
        <EmailSetupBanner settingsLink={false} />
        <EmailHaltNotice />
        <ServerSending sender={sender} />
        <HowItWorks
          title={t('how', 'How it works')}
          lines={HOW_IT_WORKS_SERVER.map(([key, text]) => t(`how-server-${key}`, text))}
        />
      </div>
    );
  }

  const server =
    saved?.provider === 'smtp' ? `${saved.smtpHost}:${saved.smtpPort}` : saved?.region || null;

  return (
    <div className="space-y-6">
      <EmailSetupBanner settingsLink={false} />
      <EmailHaltNotice />
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
        <>
          <ServerSending sender={sender} />
          <p className="text-sm text-muted-foreground">
            {t(
              'set-up-hint',
              'Emails go out from erxes’s address. Set up your own server or account to send from yours.',
            )}
          </p>
        </>
      )}
      {saved && <EventsHelp saved={saved} />}
      <HowItWorks
        title={t('how', 'How it works')}
        lines={HOW_IT_WORKS.map(([key, text]) => t(`how-${key}`, text))}
      />
    </div>
  );
};

/** The settings tab: SaaS shows erxes' sender, self-hosted its own; both list the Reply-To addresses. */
const SettingsTab = ({ sender, saved }: { sender: EmailSender; saved: EmailSettings | null }) =>
  sender.ownSending ? (
    <div className="space-y-6">
      <EmailForm key={saved?.updatedAt ?? 'new'} saved={saved} />
      <ReplyTosSection byLink={false} />
      {saved && <RemoveEmail />}
    </div>
  ) : (
    <div className="space-y-6">
      <ServerSender sender={sender} />
      <ReplyTosSection byLink />
    </div>
  );

/** What the header offers: a test once set up, else the way to set it up; SaaS: nothing to set up. */
const HeaderAction = ({
  sender,
  saved,
  onSetUp,
}: {
  sender: EmailSender;
  saved: EmailSettings | null;
  onSetUp: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  if (!sender.ownSending) return null;

  return saved ? (
    <SendTest />
  ) : (
    <Button onClick={onSetUp}>{t('email.set-up-short', 'Set up')}</Button>
  );
};

const EmailPage = ({ sender, saved }: { sender: EmailSender; saved: EmailSettings | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const [tab, setTab] = useIntegrationTab('overview');

  const tabs = [
    {
      value: 'overview',
      label: t('tab.overview', 'Overview'),
      content: <Overview sender={sender} saved={saved} />,
    },
    {
      value: 'settings',
      label: t('tab.settings', 'Settings'),
      content: <SettingsTab sender={sender} saved={saved} />,
    },
    {
      value: 'activity',
      label: t('tab.activity', 'Activity'),
      content: <EmailDeliveriesTab />,
    },
    {
      value: 'addresses',
      label: t('tab.addresses', 'Addresses'),
      content: <EmailAddressesTab />,
    },
    {
      value: 'limits',
      label: t('tab.limits', 'Limits'),
      content: <EmailLimitsTab />,
    },
  ];

  const current = tabs.find((item) => item.value === tab) ?? tabs[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">{t('name.email', 'Email sending')}</h1>
            <IntegrationStatusBadge
              status={{
                state:
                  sender.canDeliver && (saved !== null || !sender.ownSending)
                    ? 'connected'
                    : 'not-set-up',
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t(
              'catalog.email',
              'Invitations, notifications and broadcasts from your own address: SMTP, SendGrid or Amazon SES.',
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <HeaderAction sender={sender} saved={saved} onSetUp={() => setTab('settings')} />
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

/** Settings › Email sending: how the organisation's emails go out, and its settings. */
export const EmailSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const canManage = useCan()('integrations.manage');

  const settings = useQuery(
    orpc.emails.settings.queryOptions({ input: canManage ? undefined : skipToken }),
  );

  const sender = useQuery(
    orpc.emails.sender.queryOptions({ input: canManage ? undefined : skipToken }),
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
        <QueryState query={sender} className="py-12">
          {(from) => (
            <QueryState query={settings} className="py-12">
              {(saved) => <EmailPage sender={from} saved={saved} />}
            </QueryState>
          )}
        </QueryState>
      </ScrollArea>
    </PageContainer>
  );
};
