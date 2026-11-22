import { IconPlus } from '@tabler/icons-react';
import { Badge, Button, CONNECTION_CONTENT_TYPE, useOpenRecord } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useSession } from '~/modules/auth/session';
import { ConnectionList } from '../vault/ConnectionList';
import { connectionsOf, useConnections } from '../vault/useVault';
import type { CoreIntegration } from './catalog';
import { CredentialsHelp } from './ConnectionFields';
import {
  IntegrationLayout,
  type IntegrationTab,
  OverviewSection,
  useIntegrationTab,
} from './IntegrationLayout';

const PaymentFacts = ({ payments }: { payments: NonNullable<CoreIntegration['payments']> }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { currency } = useSession().organization;
  const { currencies, refunds, pays } = payments;
  const takes = !currencies.length || currencies.includes(currency);

  const listed =
    currencies.length > 3
      ? t('many-currencies', '{{count}} currencies', { count: currencies.length })
      : currencies.join(', ');

  return (
    <div className="space-y-2 rounded-lg border p-4 text-sm">
      <p>{t(`pays.${pays}`, pays)}</p>
      <span className="flex flex-wrap items-center gap-1.5">
        {takes ? (
          <Badge variant="secondary">
            {currencies.length ? listed : t('takes-any', 'Any currency')}
          </Badge>
        ) : (
          <Badge variant="warning">
            {t('takes-only', 'Takes {{currencies}} only', { currencies: listed })}
          </Badge>
        )}
        {refunds !== 'none' && (
          <Badge variant="secondary">
            {refunds === 'partial'
              ? t('refunds-partial', 'Refunds')
              : t('refunds-full', 'Full refunds')}
          </Badge>
        )}
      </span>
    </div>
  );
};

const Overview = ({ integration }: { integration: CoreIntegration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const connections = useConnections();

  return (
    <div className="space-y-6">
      <OverviewSection title={t('connections', 'Connections')}>
        <QueryState
          query={connections}
          isEmpty={({ data }) => !connectionsOf(data, [integration]).length}
          empty={
            <p className="rounded-lg border p-4 text-sm">{t('none', 'Nothing connected yet.')}</p>
          }
        >
          {({ data }) => (
            <ConnectionList rows={connectionsOf(data, [integration])} showService={false} />
          )}
        </QueryState>
      </OverviewSection>
      {integration.payments && (
        <OverviewSection title={t('payments', 'How payers pay')}>
          <PaymentFacts payments={integration.payments} />
        </OverviewSection>
      )}
      <CredentialsHelp integration={integration} />
    </div>
  );
};

const Connect = ({ integration }: { integration: CoreIntegration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { openNew } = useOpenRecord();

  return (
    <Button onClick={() => openNew(CONNECTION_CONTENT_TYPE, { integration: integration.key })}>
      <IconPlus />
      {t('connect', 'Connect')}
    </Button>
  );
};

/** An integration's page: its connections, then any `tabs` of its own (a bank's accounts). */
export const ConnectionsIntegration = ({
  integration,
  tabs = [],
}: {
  integration: CoreIntegration;
  tabs?: IntegrationTab[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const [tab, setTab] = useIntegrationTab('overview');

  return (
    <IntegrationLayout
      integration={integration}
      tab={tab}
      onTab={setTab}
      actions={<Connect integration={integration} />}
      tabs={[
        {
          value: 'overview',
          label: t('tab.overview', 'Overview'),
          content: <Overview integration={integration} />,
        },
        ...tabs,
      ]}
    />
  );
};
