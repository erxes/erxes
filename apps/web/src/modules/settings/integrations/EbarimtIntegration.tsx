import type { EbarimtSettings } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Badge, Button, cn, Label, Switch } from 'erxes-ui';
import { useId, useState } from 'react';
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

/** Turns a config's receipts on or off, keeping its settings. */
const ConfigSwitch = ({ config }: { config: EbarimtSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const id = useId();
  const save = useMutation(orpc.ebarimt.updateConfig.mutationOptions(useRefreshFailed()));

  return (
    <span className="flex items-center gap-2 text-sm">
      <Switch
        id={id}
        checked={config.status === 'active'}
        disabled={save.isPending}
        onCheckedChange={(on) => save.mutate({ ...config, status: on ? 'active' : 'disabled' })}
      />
      <Label htmlFor={id} variant="plain">
        {t('active', 'Send receipts')}
      </Label>
    </span>
  );
};

/** Removes a config that sent no receipts, after asking; one that did is turned off instead. */
const RemoveConfig = ({
  config,
  onRemoved,
}: {
  config: EbarimtSettings;
  onRemoved: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });

  const remove = useMutation(
    orpc.ebarimt.removeConfig.mutationOptions({ ...useRefreshFailed(), onSuccess: onRemoved }),
  );

  return (
    <DangerSection
      title={t('remove-title', 'Remove this config')}
      description={t(
        'remove-description',
        'Only a config that sent no receipts can go. Turn one that did off instead, so its receipts can still be returned.',
      )}
      confirmMessage={t('remove-confirm', 'Remove {{name}}?', { name: config.name })}
      label={t('remove', 'Remove')}
      pending={remove.isPending}
      onConfirm={() => remove.mutate({ id: config.id })}
    />
  );
};

/** Each config with its merchant, the default first; picking one opens it below. */
const ConfigList = ({
  configs,
  selected,
  onSelect,
}: {
  configs: EbarimtSettings[];
  selected: string;
  onSelect: (id: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const makeDefault = useMutation(orpc.ebarimt.updateConfig.mutationOptions(useRefreshFailed()));

  return (
    <div className="space-y-2">
      <ul className="divide-y rounded-lg border">
        {configs.map((config) => (
          <li
            key={config.id}
            className={cn(
              'flex flex-wrap items-center gap-3 px-4 py-3',
              config.id === selected && 'bg-accent/40',
            )}
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onSelect(config.id)}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {config.name}
                {config.isDefault && <Badge variant="secondary">{t('default', 'Default')}</Badge>}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {config.companyName} · {t('tin', 'TIN')} {config.merchantTin}
                {config.posNo && ` · POS ${config.posNo}`}
              </span>
            </button>
            {!config.isDefault && (
              <Button
                size="sm"
                variant="ghost"
                disabled={makeDefault.isPending}
                onClick={() => makeDefault.mutate({ ...config, isDefault: true })}
              >
                {t('make-default', 'Make default')}
              </Button>
            )}
            <ConfigSwitch config={config} />
          </li>
        ))}
      </ul>
      <Button size="sm" variant="secondary" onClick={() => onSelect(NEW)}>
        {t('add-config', 'Add config')}
      </Button>
    </div>
  );
};

/** The list key of a config not saved yet. */
const NEW = 'new';

/** The configs, and the one picked (or a new one) to change. */
const ConfigsTab = ({ configs }: { configs: EbarimtSettings[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const [picked, setPicked] = useState<string>(configs[0]?.id ?? NEW);
  const config = configs.find((row) => row.id === picked) ?? null;
  const selected = config?.id ?? NEW;

  return (
    <div className="space-y-6">
      {configs.length > 0 && (
        <ConfigList configs={configs} selected={selected} onSelect={setPicked} />
      )}
      {configs.length > 0 && !config && (
        <p className="text-sm text-muted-foreground">
          {t(
            'new-config-hint',
            'Another merchant or branch: invoices go through the default unless a plugin picks this one.',
          )}
        </p>
      )}
      <EbarimtForm
        key={config ? `${config.id}-${config.updatedAt}` : NEW}
        saved={config}
        onSaved={(saved) => setPicked(saved.id)}
      />
      {config && <RemoveConfig config={config} onRemoved={() => setPicked(NEW)} />}
    </div>
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
  count,
  failed,
  onTab,
}: {
  /** The default config. */
  saved: EbarimtSettings | null;
  count: number;
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
        <OverviewSection
          title={t('connected-to', {
            count,
            defaultValue_one: 'Connected to',
            defaultValue_other: 'Connected to {{count}} merchants; the default:',
          })}
        >
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
  configs,
}: {
  integration: Integration;
  configs: EbarimtSettings[];
}) => {
  const saved = configs.find((config) => config.isDefault) ?? null;
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const canPayments = useCan()('payments.manage');
  const [tab, setTab] = useIntegrationTab('overview');
  const { status } = integration;
  const failed = status.state === 'attention' ? (status.count ?? 0) : 0;

  const tabs = [
    {
      value: 'overview',
      label: t('tab.overview', 'Overview'),
      content: <Overview saved={saved} count={configs.length} failed={failed} onTab={setTab} />,
    },
    {
      value: 'settings',
      label: t('tab.settings', 'Settings'),
      content: <ConfigsTab configs={configs} />,
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
        saved ? undefined : (
          <Button onClick={() => setTab('settings')}>{t('ebarimt.set-up-short', 'Set up')}</Button>
        )
      }
    />
  );
};

/** eBarimt's page: what it does, its configs, and the receipts they sent. */
export const EbarimtIntegration = ({ integration }: { integration: Integration }) => {
  const configs = useQuery(orpc.ebarimt.configs.queryOptions());

  return (
    <QueryState query={configs}>
      {({ data }) => <EbarimtPage integration={integration} configs={data} />}
    </QueryState>
  );
};
