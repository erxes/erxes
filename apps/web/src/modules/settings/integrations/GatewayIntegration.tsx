import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useSession } from '~/modules/auth/session';
import { AddGateway } from '../payments/AddGateway';
import { GatewayFacts } from '../payments/GatewayPicker';
import { GatewayList } from '../payments/Gateways';
import type { Integration } from './catalog';
import { IntegrationLayout, OverviewSection, useIntegrationTab } from './IntegrationLayout';

type GatewayEntry = Extract<Integration, { kind: 'gateway' }>;

const Overview = ({ integration }: { integration: GatewayEntry }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.gateway' });
  const { currency } = useSession().organization;

  return (
    <div className="space-y-6">
      <OverviewSection title={t('takes', 'Takes and refunds')}>
        <GatewayFacts kind={integration.gateway} currency={currency} />
      </OverviewSection>
      <OverviewSection title={t('how', 'How it works')}>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            {t(
              'how-invoices',
              'Plugins bill through it: the payer pays on its page or app, and core marks the invoice paid.',
            )}
          </li>
          <li>
            {t(
              'how-credentials',
              'Credentials are checked with the gateway when you connect, and stored encrypted.',
            )}
          </li>
          <li>
            {t('how-payments', 'Which plugins use which gateway is set on')}{' '}
            <Link to={paths.settings.payments} className="text-primary-text underline">
              {t('payments-link', 'Payments')}
            </Link>
            .
          </li>
        </ul>
      </OverviewSection>
    </div>
  );
};

/** This kind's connections: one per merchant account. */
const Connections = ({ integration }: { integration: GatewayEntry }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.gateway' });
  const gateways = useQuery(orpc.payments.gateways.queryOptions());

  return (
    <QueryState query={gateways}>
      {({ data: rows }) => {
        const own = rows.filter((gateway) => gateway.kind === integration.gateway);

        return own.length ? (
          <GatewayList gateways={own} />
        ) : (
          <p className="rounded-lg border p-4 text-sm text-muted-foreground">
            {t('none', 'Not connected yet. Connect your merchant account to take payments.')}
          </p>
        );
      }}
    </QueryState>
  );
};

/** A payment gateway's page: what it takes, and its connections. */
export const GatewayIntegration = ({ integration }: { integration: GatewayEntry }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const [tab, setTab] = useIntegrationTab('overview');

  return (
    <IntegrationLayout
      integration={integration}
      tab={tab}
      onTab={setTab}
      actions={<AddGateway only={integration.gateway} />}
      tabs={[
        {
          value: 'overview',
          label: t('tab.overview', 'Overview'),
          content: <Overview integration={integration} />,
        },
        {
          value: 'connections',
          label: t('tab.connections', 'Connections'),
          content: <Connections integration={integration} />,
        },
      ]}
    />
  );
};
