import type { EbarimtSettings } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Label, Switch } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useCan } from '~/modules/auth/session';
import type { Integration } from './catalog';
import { useIntegrationsSaved } from './useIntegrationsSaved';
import { DangerSection } from './DangerSection';
import { EbarimtActivity } from './EbarimtActivity';
import { EbarimtForm } from './EbarimtForm';
import { EbarimtPrint } from './EbarimtPrint';
import {
  HowItWorks,
  IntegrationLayout,
  OverviewSection,
  useIntegrationTab,
} from './IntegrationLayout';

const useRefreshFailed = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });

  return useIntegrationsSaved(t('save-failed', 'Could not save'), undefined, orpc.ebarimt.key());
};

/** Turns receipts on or off, keeping the settings. */
const EbarimtSwitch = ({ saved }: { saved: EbarimtSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const id = useId();
  const save = useMutation(orpc.ebarimt.saveSettings.mutationOptions(useRefreshFailed()));

  return (
    <span className="flex items-center gap-2 text-sm">
      <Switch
        id={id}
        checked={saved.status === 'active'}
        disabled={save.isPending}
        onCheckedChange={(on) => save.mutate({ ...saved, status: on ? 'active' : 'disabled' })}
      />
      <Label htmlFor={id} variant="plain">
        {t('active', 'Send receipts')}
      </Label>
    </span>
  );
};

/** Removes eBarimt, after asking: the danger zone at the end of its settings. */
const RemoveEbarimt = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const remove = useMutation(orpc.ebarimt.removeSettings.mutationOptions(useRefreshFailed()));

  return (
    <DangerSection
      title={t('remove-title', 'Remove eBarimt')}
      description={t(
        'remove-description',
        'No more receipts are sent. Issued ones stay with their invoices.',
      )}
      confirmMessage={t(
        'remove-confirm',
        'Remove eBarimt? Issued receipts stay with their invoices.',
      )}
      label={t('remove', 'Remove')}
      pending={remove.isPending}
      onConfirm={() => remove.mutate({})}
    />
  );
};

const HOW_IT_WORKS = [
  ['paid', 'Each paid invoice in tögrög gets a receipt, by gateway or in cash.'],
  ['refunds', 'A partial refund replaces the receipt; a full refund returns it.'],
  ['rules', 'Rules tax chosen products and categories VAT-free, at 0%, or leave them off.'],
  ['own', 'Plugins that send their own receipts are left out.'],
  [
    'print',
    'Core prints its receipts with the template under Print; each plugin sets its own in its settings.',
  ],
] as const;

const Overview = ({
  saved,
  failed,
  onTab,
}: {
  saved: EbarimtSettings | null;
  failed: number;
  onTab: (tab: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });

  return (
    <div className="space-y-6">
      {failed > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
          <IconAlertTriangle className="size-4 text-warning-text" />
          <span className="flex-1">
            {t('failed-count', {
              count: failed,
              defaultValue_one: '{{count}} receipt could not be sent.',
              defaultValue_other: '{{count}} receipts could not be sent.',
            })}
          </span>
          <Button size="sm" variant="secondary" onClick={() => onTab('activity')}>
            {t('review', 'Review')}
          </Button>
        </div>
      )}
      {saved ? (
        <OverviewSection title={t('connected-to', 'Connected to')}>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-1.5 rounded-lg border p-4 text-sm">
            <dt className="text-muted-foreground">{t('field.companyName', 'Company name')}</dt>
            <dd className="col-span-2">{saved.companyName}</dd>
            <dt className="text-muted-foreground">{t('tin', 'TIN')}</dt>
            <dd className="col-span-2">{saved.merchantTin}</dd>
            <dt className="text-muted-foreground">{t('field.posApiUrl', 'PosAPI address')}</dt>
            <dd className="col-span-2 truncate">{saved.posApiUrl}</dd>
          </dl>
        </OverviewSection>
      ) : (
        <p className="rounded-lg border p-4 text-sm">
          {t(
            'set-up-hint',
            'You need your PosAPI 3.0 address and your business as registered with the tax office.',
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

const EbarimtPage = ({
  integration,
  saved,
}: {
  integration: Integration;
  saved: EbarimtSettings | null;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const canPayments = useCan()('payments.manage');
  const [tab, setTab] = useIntegrationTab('overview');
  const { status } = integration;
  const failed = status.state === 'attention' ? (status.count ?? 0) : 0;

  const tabs = [
    {
      value: 'overview',
      label: t('tab.overview', 'Overview'),
      content: <Overview saved={saved} failed={failed} onTab={setTab} />,
    },
    {
      value: 'settings',
      label: t('tab.settings', 'Settings'),
      content: (
        <div className="space-y-6">
          <EbarimtForm key={saved?.updatedAt ?? 'new'} saved={saved} />
          {saved && <RemoveEbarimt />}
        </div>
      ),
    },
    ...(saved
      ? [{ value: 'print', label: t('tab.print', 'Print'), content: <EbarimtPrint /> }]
      : []),
    ...(saved && canPayments
      ? [{ value: 'activity', label: t('tab.activity', 'Activity'), content: <EbarimtActivity /> }]
      : []),
  ];

  return (
    <IntegrationLayout
      integration={integration}
      tabs={tabs}
      tab={tab}
      onTab={setTab}
      actions={
        saved ? (
          <EbarimtSwitch saved={saved} />
        ) : (
          <Button onClick={() => setTab('settings')}>{t('ebarimt.set-up-short', 'Set up')}</Button>
        )
      }
    />
  );
};

/** eBarimt's page: what it does, its settings, and the receipts it sent. */
export const EbarimtIntegration = ({ integration }: { integration: Integration }) => {
  const settings = useQuery(orpc.ebarimt.settings.queryOptions());

  return (
    <QueryState query={settings}>
      {(saved) => <EbarimtPage integration={integration} saved={saved} />}
    </QueryState>
  );
};
