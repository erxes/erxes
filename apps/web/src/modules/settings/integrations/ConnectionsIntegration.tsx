import type { IntegrationConnection } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useSession } from '~/modules/auth/session';
import type { CoreIntegration } from './catalog';
import { CredentialsHelp } from './ConnectionFields';
import { ConnectIntegration } from './ConnectIntegration';
import { EditConnection, useConnectionChanges } from './EditConnection';
import { IntegrationLayout, OverviewSection, useIntegrationTab } from './IntegrationLayout';

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

const ConnectionList = ({
  integration,
  connections,
}: {
  integration: CoreIntegration;
  connections: IntegrationConnection[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { update } = useConnectionChanges();

  return (
    <ul className="divide-y rounded-lg border">
      {connections.map((connection) => (
        <li key={connection.id} className="flex items-center gap-3 p-3">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={
                connection.status === 'active' ? 'font-medium' : 'font-medium text-muted-foreground'
              }
            >
              {connection.name}
            </span>
            {connection.status !== 'active' && <Badge>{t('off-badge', 'off')}</Badge>}
            {connection.settings.sandbox === true && (
              <Badge variant="warning">{t('sandbox-badge', 'sandbox')}</Badge>
            )}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1">
            <EditConnection integration={integration} connection={connection} />
            <Button
              size="sm"
              variant="outline"
              disabled={update.isPending}
              onClick={() =>
                update.mutate({
                  key: integration.key,
                  id: connection.id,
                  status: connection.status === 'active' ? 'disabled' : 'active',
                })
              }
            >
              {connection.status === 'active' ? t('turn-off', 'Turn off') : t('turn-on', 'Turn on')}
            </Button>
          </span>
        </li>
      ))}
    </ul>
  );
};

const Overview = ({ integration }: { integration: CoreIntegration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });

  const connections = useQuery(
    orpc.integrations.connections.queryOptions({ input: { key: integration.key } }),
  );

  return (
    <div className="space-y-6">
      <OverviewSection title={t('connections', 'Connections')}>
        <QueryState
          query={connections}
          isEmpty={({ data }) => !data.length}
          empty={
            <p className="rounded-lg border p-4 text-sm">{t('none', 'Nothing connected yet.')}</p>
          }
        >
          {({ data }) => <ConnectionList integration={integration} connections={data} />}
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

export const ConnectionsIntegration = ({ integration }: { integration: CoreIntegration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const [tab, setTab] = useIntegrationTab('overview');

  return (
    <IntegrationLayout
      integration={integration}
      tab={tab}
      onTab={setTab}
      actions={<ConnectIntegration integration={integration} />}
      tabs={[
        {
          value: 'overview',
          label: t('tab.overview', 'Overview'),
          content: <Overview integration={integration} />,
        },
      ]}
    />
  );
};
