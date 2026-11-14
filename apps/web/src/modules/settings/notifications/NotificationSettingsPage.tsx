import {
  CORE_NOTIFICATION_GROUPS,
  NotificationDelivery,
  type NotificationSettings,
} from '@erxes/core-contract';
import { IconBellCog, IconBrowser, IconLock, IconMail } from '@tabler/icons-react';
import { PageContainer, PageHeader, ScrollArea, Select, Spinner, Switch, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { messageOf } from '@erxes/core-contract/client';
import { desktopSupported } from '~/modules/notifications/useDesktopNotifications';
import { useNotificationSettings } from '~/modules/notifications/useNotifications';

type Group = NotificationSettings['groups'][number];

/** What each of core's groups covers, in a line. */
const GROUP_HINTS: Record<string, string> = {
  assigned: 'A customer or company is given to you',
  records:
    'Someone changes, merges or deletes a customer or company you own, or a plugin adds to its timeline',
  mentions: 'Someone mentions you in a note',
  automations: 'Messages from automations, and automations you turned on that fail',
  transfer: 'Your imports finish and your exports are ready',
  security: 'Your role or password changes, new sign-ins, and security alerts for owners',
};

const Channel = ({
  icon: Icon,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  icon: typeof IconMail;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) => {
  const id = useId();

  return (
    <label htmlFor={id} className="flex items-center gap-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </label>
  );
};

const GroupRow = ({
  group,
  emailOn,
  disabled,
  onChange,
}: {
  group: Group;
  emailOn: boolean;
  disabled: boolean;
  onChange: (delivery: NotificationDelivery) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications.settings' });

  const hint = group.plugin
    ? t('plugin-hint', 'Everything {{name}} notifies you about', { name: group.label })
    : t(`hints.${group.key}`, GROUP_HINTS[group.key] ?? '');

  return (
    <div className="flex items-center gap-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">
          {group.plugin ? group.label : t(`groups.${group.key}`, group.label)}
        </span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      {group.locked ? (
        <span className="flex w-52 items-center justify-end gap-1.5 text-xs text-muted-foreground">
          <IconLock className="size-3.5" />
          {t('always-on', 'Always on')}
        </span>
      ) : (
        <Select
          value={group.delivery}
          disabled={disabled}
          onValueChange={(value) => {
            const delivery = NotificationDelivery.options.find((option) => option === value);

            if (delivery) onChange(delivery);
          }}
        >
          <Select.Trigger className="h-8 w-52">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="email">
              {emailOn
                ? t('delivery.email', 'In erxes and email')
                : t('delivery.email-off', 'In erxes (email is off)')}
            </Select.Item>
            <Select.Item value="inbox">{t('delivery.inbox', 'In erxes only')}</Select.Item>
            <Select.Item value="off">{t('delivery.off', 'Off')}</Select.Item>
          </Select.Content>
        </Select>
      )}
    </div>
  );
};

type SettingsUpdate = ReturnType<typeof useNotificationSettings>['update'];

/** The browser channel: its permission, the note under it, and the switch's handler. */
const useBrowserChannel = (update: SettingsUpdate) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications.settings' });
  const { toast } = useToast();

  const [permission, setPermission] = useState(() =>
    desktopSupported() ? Notification.permission : 'denied',
  );

  const askPermission = async () => {
    try {
      const answer = await Notification.requestPermission();

      setPermission(answer);

      if (answer === 'granted') update.mutate({ browser: true });
    } catch (failure) {
      toast({
        variant: 'destructive',
        title: t('browser', 'Browser'),
        description: messageOf(failure),
      });
    }
  };

  const toggleBrowser = (on: boolean) => {
    if (!on || !desktopSupported() || Notification.permission === 'granted') {
      update.mutate({ browser: on });

      return;
    }

    void askPermission();
  };

  const browserNote = !desktopSupported()
    ? t('browser-unsupported', "This browser can't show desktop notifications.")
    : permission === 'denied'
      ? t(
          'browser-denied',
          'Blocked in this browser: allow notifications for this site in its settings.',
        )
      : t(
          'browser-description',
          'Pop up new notifications while erxes is in the background (each browser asks once).',
        );

  return { permission, browserNote, toggleBrowser };
};

/** Email and browser, each on or off. */
const ChannelsSection = ({
  settings,
  update,
}: {
  settings: NotificationSettings;
  update: SettingsUpdate;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications.settings' });
  const { permission, browserNote, toggleBrowser } = useBrowserChannel(update);

  return (
    <section className="rounded-lg border bg-background px-5 py-2">
      <h2 className="pt-2 text-base font-semibold">{t('channels', 'How you’re notified')}</h2>
      <div className="divide-y">
        <Channel
          icon={IconMail}
          label={t('email', 'Email')}
          description={t(
            'email-description',
            'For the groups below set to “In erxes and email”. Security alerts are always emailed.',
          )}
          checked={settings.email}
          disabled={update.isPending}
          onChange={(email) => update.mutate({ email })}
        />
        <Channel
          icon={IconBrowser}
          label={t('browser', 'Browser')}
          description={browserNote}
          checked={settings.browser && permission === 'granted'}
          disabled={update.isPending || !desktopSupported() || permission === 'denied'}
          onChange={toggleBrowser}
        />
      </div>
    </section>
  );
};

/** Core's groups in their fixed order, then the plugins'. */
const GroupSections = ({
  settings,
  update,
}: {
  settings: NotificationSettings;
  update: SettingsUpdate;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications.settings' });

  const core = CORE_NOTIFICATION_GROUPS.map((definition) =>
    settings.groups.find((group) => !group.plugin && group.key === definition.key),
  ).filter((group): group is Group => Boolean(group));

  const plugins = settings.groups.filter((group) => group.plugin);

  const row = (group: Group) => (
    <GroupRow
      key={group.key}
      group={group}
      emailOn={settings.email}
      disabled={update.isPending}
      onChange={(delivery) => update.mutate({ groups: { [group.key]: delivery } })}
    />
  );

  return (
    <>
      <section className="rounded-lg border bg-background px-5 py-2">
        <h2 className="pt-2 text-base font-semibold">{t('what', 'What you hear about')}</h2>
        <div className="divide-y">{core.map(row)}</div>
      </section>
      <section className="rounded-lg border bg-background px-5 py-2">
        <h2 className="pt-2 text-base font-semibold">{t('plugins', 'Plugins')}</h2>
        {plugins.length ? (
          <div className="divide-y">{plugins.map(row)}</div>
        ) : (
          <p className="py-3 text-sm text-muted-foreground">{t('no-plugins', 'No plugins yet.')}</p>
        )}
      </section>
    </>
  );
};

const SettingsBody = () => {
  const { settings, loading, error, update } = useNotificationSettings();

  if (error) {
    return <p className="py-12 text-center text-sm text-destructive">{messageOf(error)}</p>;
  }

  if (loading || !settings) return <Spinner area="lg" />;

  return (
    <>
      <ChannelsSection settings={settings} update={update} />
      <GroupSections settings={settings} update={update} />
    </>
  );
};

/**
 * Settings › Notifications: how you're told (email, browser) and, per group
 * of notifications (each plugin one group), whether in erxes and by email,
 * in erxes only, or not at all. Security is always on.
 */
export const NotificationSettingsPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications.settings' });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Notifications'),
                to: '/settings/notifications',
                icon: IconBellCog,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'description',
              'Choose how and about what you hear. These settings are yours; teammates choose their own.',
            )}
          </p>
          <SettingsBody />
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
