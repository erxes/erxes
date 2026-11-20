import type { MetaAppSettings } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import type { Integration } from './catalog';
import {
  HowItWorks,
  IntegrationLayout,
  OverviewSection,
  useIntegrationTab,
} from './IntegrationLayout';
import { MetaAppKeys } from './MetaAppKeys';
import { ConnectPages, MetaConnections } from './MetaConnections';

const useLoginOutcome = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });
  const { toast } = useToast();

  const [{ connected, error }, setOutcome] = useQueryStates({
    connected: parseAsInteger,
    error: parseAsString,
  });

  const shown = useRef(false);

  useEffect(() => {
    if ((connected === null && error === null) || shown.current) return;

    shown.current = true;
    toast(
      error === null
        ? {
            title: t('connected-count', {
              count: connected ?? 0,
              defaultValue_one: '{{count}} page or account connected',
              defaultValue_other: '{{count}} pages and accounts connected',
            }),
          }
        : {
            variant: 'destructive',
            title: t('connect-failed', 'Could not connect'),
            description: error,
          },
    );
    void setOutcome({ connected: null, error: null });
  }, [connected, error, setOutcome, t, toast]);
};

const HOW_IT_WORKS = [
  ['events', 'Messages, comments and reactions on your pages start automations.'],
  ['reply', 'Automations reply, comment and like as the page.'],
  [
    'apps',
    'Pages connect through your own Meta app, or through this install’s when you have none.',
  ],
] as const;

const Overview = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });

  return (
    <div className="space-y-6">
      <OverviewSection title={t('connections', 'Pages and accounts')}>
        <MetaConnections />
      </OverviewSection>
      <HowItWorks
        title={t('how', 'How it works')}
        lines={HOW_IT_WORKS.map(([key, text]) => t(`how-${key}`, text))}
      />
    </div>
  );
};

const MetaPage = ({ integration, app }: { integration: Integration; app: MetaAppSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const [tab, setTab] = useIntegrationTab('overview');

  useLoginOutcome();

  const tabs = [
    { value: 'overview', label: t('tab.overview', 'Overview'), content: <Overview /> },
    { value: 'keys', label: t('tab.app-keys', 'App keys'), content: <MetaAppKeys app={app} /> },
  ];

  return (
    <IntegrationLayout
      integration={integration}
      tabs={tabs}
      tab={tab}
      onTab={setTab}
      actions={<ConnectPages onNotSetUp={() => setTab('keys')} />}
    />
  );
};

export const MetaIntegration = ({ integration }: { integration: Integration }) => {
  const app = useQuery(orpc.meta.app.queryOptions());

  return (
    <QueryState query={app}>
      {(saved) => <MetaPage integration={integration} app={saved} />}
    </QueryState>
  );
};
