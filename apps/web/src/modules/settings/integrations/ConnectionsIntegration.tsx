import { IconPlus } from '@tabler/icons-react';
import { Badge, Button, CONNECTION_CONTENT_TYPE, useOpenRecord } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useSession } from '~/modules/auth/session';
import { ConnectionList } from '../vault/ConnectionList';
import { isOAuthIntegration, OAuthAppForm } from '../vault/SignInForm';
import { connectionsOf, useConnections } from '../vault/useVault';
import type { Integration } from './catalog';
import { AutomationTriggers } from './AutomationTriggers';
import { CredentialsHelp } from './ConnectionFields';
import {
  IntegrationLayout,
  type IntegrationTab,
  OverviewSection,
  useIntegrationTab,
} from './IntegrationLayout';
import { JoinedUses, useJoinedTabs } from './JoinedIntegrations';

const PaymentFacts = ({ payments }: { payments: NonNullable<Integration['payments']> }) => {
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

const Overview = ({ integration }: { integration: Integration }) => {
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
      <JoinedUses integration={integration} />
      <AutomationTriggers integration={integration} />
      {isOAuthIntegration(integration) && integration.oauth.client === 'organization' && (
        <OverviewSection title={t('app', 'App')}>
          {connectionsOf(connections.data?.data ?? [], [integration]).length ? (
            <p className="rounded-lg border p-4 text-sm">
              {t(
                'app-in-use',
                'Client id {{clientId}}. Remove the connections to change the app.',
                {
                  clientId: integration.oauth.clientId,
                },
              )}
            </p>
          ) : (
            <OAuthAppForm integration={integration} />
          )}
        </OverviewSection>
      )}
      {integration.payments && (
        <OverviewSection title={t('payments', 'How payers pay')}>
          <PaymentFacts payments={integration.payments} />
        </OverviewSection>
      )}
      <CredentialsHelp integration={integration} />
    </div>
  );
};

const Connect = ({ integration }: { integration: Integration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { openNew } = useOpenRecord();
  const connected = (useConnections().data?.data ?? []).some(({ key }) => key === integration.key);

  return (
    <Button
      variant={connected ? 'outline' : 'default'}
      onClick={() => openNew(CONNECTION_CONTENT_TYPE, { integration: integration.key })}
    >
      <IconPlus />
      {!connected
        ? t('connect', 'Connect')
        : isOAuthIntegration(integration)
          ? t('add-account', 'Add account')
          : t('add-another', 'Add another')}
    </Button>
  );
};

/**
 * An integration's page: its connections, then any `tabs` of its own (a bank's accounts), then
 * those of the plugins' integrations that connect through it (Frontline's pages).
 */
export const ConnectionsIntegration = ({
  integration,
  tabs = [],
}: {
  integration: Integration;
  tabs?: IntegrationTab[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const [tab, setTab] = useIntegrationTab('overview');
  const joinedTabs = useJoinedTabs(integration);

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
        ...joinedTabs,
      ]}
    />
  );
};
