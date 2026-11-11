import { CORE_NOTIFICATION_KINDS, UNMUTABLE_NOTIFICATION_KINDS } from '@erxes/core-contract';
import { IconBellCog } from '@tabler/icons-react';
import { PageContainer, ScrollArea, Spinner, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { useInboxes, useNotificationSettings } from '~/modules/notifications/useNotifications';

/** English wording of core's kinds; translations under `notifications.settings.kinds`. */
const KIND_LABELS: Record<string, string> = {
  'core.customer.assigned': 'A customer is assigned to me',
  'core.customer.updated': 'Someone changes a customer I own',
  'core.customer.merged': 'A customer I own is merged',
  'core.customer.deleted': 'A customer I own is deleted',
  'core.company.assigned': 'A company is assigned to me',
  'core.company.updated': 'Someone changes a company I own',
  'core.company.merged': 'A company I own is merged',
  'core.company.deleted': 'A company I own is deleted',
  'core.user.role_changed': 'My role changes',
  'core.user.password_set': 'An admin sets my password',
  'core.note.mentioned': 'Someone mentions me in a note',
};

const Row = ({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className="flex items-center justify-between gap-4 py-2.5">
    <span>
      <span className="block text-sm">{label}</span>
      {description && <span className="block text-xs text-muted-foreground">{description}</span>}
    </span>
    <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
  </label>
);

/** Settings › Notifications: what reaches my inbox, per inbox and per kind. */
export const NotificationSettingsPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications.settings' });
  const { settings, loading, update } = useNotificationSettings();
  const inboxes = useInboxes().filter((inbox) => inbox.source !== 'core');
  const muted = new Set(settings?.muted ?? []);

  const toggle = (entry: string, on: boolean) => {
    const next = new Set(muted);

    if (on) next.delete(entry);
    else next.add(entry);

    update.mutate([...next]);
  };

  // Core's kinds that are about this member (the `*.activity` ones come from plugins' inboxes).
  const coreKinds = CORE_NOTIFICATION_KINDS.filter((kind) => !kind.endsWith('.activity'));

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
              'Choose what reaches your inbox. These settings are yours; teammates choose their own.',
            )}
          </p>
          {loading ? (
            <Spinner containerClassName="py-12" />
          ) : (
            <>
              <section className="rounded-lg border bg-background px-5 py-3">
                <h2 className="pb-1 text-base font-semibold">erxes</h2>
                <div className="divide-y">
                  {coreKinds.map((kind) => {
                    const locked = UNMUTABLE_NOTIFICATION_KINDS.includes(kind);

                    return (
                      <Row
                        key={kind}
                        label={t(`kinds.${kind.replaceAll('.', '_')}`, KIND_LABELS[kind] ?? kind)}
                        description={
                          locked
                            ? t('always-on', 'Always on, for your account’s safety')
                            : undefined
                        }
                        checked={locked || !muted.has(kind)}
                        disabled={locked || update.isPending}
                        onChange={(on) => toggle(kind, on)}
                      />
                    );
                  })}
                </div>
              </section>
              <section className="rounded-lg border bg-background px-5 py-3">
                <h2 className="text-base font-semibold">{t('plugins', 'Plugins')}</h2>
                <p className="pb-1 text-xs text-muted-foreground">
                  {t(
                    'plugins-description',
                    'Each plugin has its own inbox. Turn one off to stop all of its notifications.',
                  )}
                </p>
                {inboxes.length ? (
                  <div className="divide-y">
                    {inboxes.map((inbox) => (
                      <Row
                        key={inbox.source}
                        label={inbox.label}
                        checked={!muted.has(inbox.source)}
                        disabled={update.isPending}
                        onChange={(on) => toggle(inbox.source, on)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-3 text-sm text-muted-foreground">
                    {t('no-plugins', 'No plugin has notified you yet.')}
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
